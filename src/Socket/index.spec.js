import React, { Component } from 'react';
import _ from 'lodash';
import { render, wait, prettyDOM, fireEvent, Simulate } from 'react-testing-library';

import { Socket } from './index';
import { SocketContext } from '../..';

class Dummy extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id='test-wrapper' {...this.props}>
        <span id='props-length'>{ Object.keys(this.props).length }</span>
      </div>);
  }
}

let scopedMock = jest.fn();
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  removeListener: jest.fn()
}

// set the mockSocket to be provided.
render(
  <SocketContext.Consumer>
    {ctx => ctx.setSocket(mockSocket)}
  </SocketContext.Consumer>
)

beforeEach(() => {
  scopedMock.mockReset();
  mockSocket.on.mockReset();
  mockSocket.emit.mockReset();
  mockSocket.removeListener.mockReset();
})

describe('Socket smoke tests', () => {
  it('renders Socket.On without crashing', () => {
    render(<Socket.On />);
  });

  it('renders Socket.Emit without crashing', () => {
    render(<Socket.Emit />);
  });

  it('renders Socket.Emit with wrapped without crashing', () => {
    render(<Socket.Emit renders={Dummy} />);
  });
});

describe('Socket.On Unit Tests', () => {
  it('registers an event with a handler', () => {
    let call = new scopedMock();
    call.name = 'helloWorldHandler';
    render(<Socket.On event='hello-world' call={call} />);
    expect(mockSocket.on.mock.calls[0][0]).toEqual('hello-world');
    expect(mockSocket.on.mock.calls[0][1].name).toEqual('helloWorldHandler');
  });

  it('registers handlers for multiple events', () => {
    let calls = _.range(3).map(i => new scopedMock())
    calls.map((fn, i) => {fn.name = `handle${i}`});
    const events = calls.map((call, i) => ({event: `event-${i}`, use: call}));
    render(<Socket.On handles={events} />);
    mockSocket.on.mock.calls.map((args, i) => {
      expect(args[0]).toEqual(`event-${i}`);
      expect(args[1].name).toEqual(`handle${i}`);
    });
  });
});

describe('Socket.Emit Unit Tests', () => {
  it('fires event with payload for onMount', () => {
    const onMounts = [{event: 'on-load-event', payload: 'a happy little string'}];
    render(<Socket.Emit onMount={onMounts} />);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires only the supplied event on mount with empty payload', () => {
    render(<Socket.Emit event='on-load-event' />);
    expect(mockSocket.emit.mock.calls[0][1]).toEqual({});
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
  });

  it('fires the supplied event on mount with payload', () => {
    const load = {data: 'pretty sneaky sis'}
    render(<Socket.Emit event='on-load-event' payload={load} />);
    expect(mockSocket.emit.mock.calls[0].length).toBe(2);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toBe(load);
  });

  it('doesn\'t fire onUpdate when first mounting', () => {
    const onUpdates = [{event: 'on-update-event', payload: 'a happy little string'}];
    const {rerender} = render(<Socket.Emit onUpdates={onUpdates} />);
    expect(mockSocket.emit.mock.calls).toEqual([]);
  });

  it('fires event with payload for onUpdate', () => {
    const onUpdates = [{event: 'on-update-event', payload: 'a happy little string'}];
    const {rerender} = render(<Socket.Emit onUpdates={onUpdates} />);
    rerender(<Socket.Emit onUpdate={onUpdates} />);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('will not fire same update emission twice without `force` prop', () => {
    const onUpdates = [{event: 'on-update-event', payload: 'a happy little string'}];
    const {rerender} = render(<Socket.Emit onUpdates={onUpdates} />);
    rerender(<Socket.Emit onUpdate={onUpdates} />);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
    rerender(<Socket.Emit onUpdate={onUpdates} />);
    expect(mockSocket.emit.mock.calls.length).toBe(1)
  });

  it('will fire same update emission twice with `force` prop', () => {
    const onUpdates = [{event: 'on-update-event', payload: 'a happy little string'}];
    const {rerender} = render(<Socket.Emit onUpdates={onUpdates} />);
    rerender(<Socket.Emit onUpdate={onUpdates} />);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
    rerender(<Socket.Emit onUpdate={onUpdates} force />);
    expect(mockSocket.emit.mock.calls.length).toBe(2)
  });

  it('wraps a component', () => {
    const { container } = render(<Socket.Emit renders={Dummy} />);
    return wait(() => {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it('fires a single emit with onClick of wrapped component', () => {
      const {container} = render(<Socket.Emit renders={Dummy} domEvent='onClick' event='button-press-event' />);
      expect(mockSocket.emit.mock.calls.length).toBe(0);
      Simulate.click(container.firstChild);
      expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('fires multiple emissions with onClick of wrapped component', () => {
    const emissions = [
      {event: 'clicked-first-event', payload: {}},
      {event: 'clicked-second-event', payload: {}},
      {event: 'clicked-third-event', payload: {}}
    ];
    const {container} = render(<Socket.Emit renders={Dummy} domEvent='onClick' emissions={emissions} />);
    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(3);
  });

  it('fires emissions and an event if passed with onClick of wrapped component', () => {
    const emissions = [
      {event: 'clicked-first-event', payload: {}},
      {event: 'clicked-second-event', payload: {}},
      {event: 'clicked-third-event', payload: {}}
    ];
    const {container} = render(<Socket.Emit renders={Dummy} domEvent='onClick' event='say-hello' emissions={emissions} />);
    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(4);
  });

  it('passes through non-api props to wrapped component', () => {
    const passThrough = {one: 1, two: 2, three: 3};
    const {container} = render(<Socket.Emit renders={Dummy} {...passThrough} />);
    expect(container.querySelector('#props-length').textContent).toBe('3')
  });

  it('wraps children and fires a domEvent for them', () => {
    const {container} = render(
      <Socket.Emit domEvent='onClick' event='hello-work'>
        <Dummy />
      </Socket.Emit>);
      expect(mockSocket.emit.mock.calls.length).toBe(0);
      Simulate.click(container.firstChild);
      expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('does not override the child handler for the event', () => {
    const spy = jest.fn();
    const {container} = render(
      <Socket.Emit domEvent='onClick' event='hello-work'>
        <Dummy onClick={spy} />
      </Socket.Emit>);
      expect(spy.mock.calls.length).toBe(0);
      Simulate.click(container.firstChild);
      expect(spy.mock.calls.length).toBe(1);
  });

  it('handles mouse enter', () => {
    const {container} = render(
      <Socket.Emit domEvent='onMouseEnter' event='mouse-entered'>
        <Dummy />
      </Socket.Emit>);
      const div = container.querySelector('#test-wrapper');
      // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
      expect(mockSocket.emit.mock.calls.length).toBe(0);
      Simulate.mouseEnter(container.firstChild);
      expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

});