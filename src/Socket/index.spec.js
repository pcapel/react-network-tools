import React, { Component } from 'react';
import _ from 'lodash';
import { render, wait, prettyDOM, fireEvent } from 'react-testing-library';
import { Simulate } from 'react-dom/test-utils';
import { SocketIO, Server } from 'mock-socket';

import { Socket } from './index';
import { withSocketContext, reactEvents } from '../utils';

// TODO: get rid of the "with context" tests, they're dumb and not needed

// https://github.com/thoov/mock-socket/issues/176
jest.useFakeTimers();

const simpleSpy = jest.fn();

const simpleMockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  removeListener: jest.fn()
}

const MockContext = React.createContext(simpleMockSocket);
class MockApp extends Component {
  render() {
    return (
      <MockContext.Provider value={simpleMockSocket}>
        {this.props.children}
      </MockContext.Provider>
    );
  }
}


beforeEach(() => {
  simpleMockSocket.on.mockReset();
  simpleMockSocket.emit.mockReset()
  simpleMockSocket.removeListener.mockReset()
});

class TestDummy extends Component {
  render() {
    const eventHandlers = _.pick(this.props, reactEvents);
    return (
      <div id='test-wrapper' {...eventHandlers}>
        <span id='props-length'>{ Object.keys(this.props).length }</span>
        <ul>
          {Object.keys(this.props).map((propName) => {
            return <li key={propName} id={propName}>{this.props[propName] + ''}</li>;
          })}
        </ul>
      </div>
    );
  }
}

const CtxSocket = withSocketContext(MockContext);

describe('Socket smoke tests', () => {
  it('renders Socket.On without crashing', () => {
    render(<Socket.On />);
  });

  it('renders Socket.Emit without crashing', () => {
    render(<Socket.Emit />);
  });

  it('renders Socket.Emit with wrapped without crashing', () => {
    render(<Socket.Emit renders={TestDummy} />);
  });
});

describe('Socket.On Unit Tests', () => {
  it('registers an event with a handler', () => {
    let call = new simpleSpy();
    render(<Socket.On socket={simpleMockSocket} event='hello-world' call={call} />);
    expect(simpleMockSocket.on).toBeCalledWith('hello-world', call)
  });

  it('registers an event with a handler using context', () => {
    let call = new simpleSpy();
    render(
      <MockApp>
        <CtxSocket.On event='hello-world' call={call} />
      </MockApp>
    );
    expect(simpleMockSocket.on).toBeCalledWith('hello-world', call);
  });

  it('registers handlers for multiple events', () => {
    let calls = _.range(3).map(i => new simpleSpy())
    calls.map((fn, i) => {fn.name = `handle${i}`});
    const events = calls.map((call, i) => ({event: `event-${i}`, use: call}));
    render(<Socket.On socket={simpleMockSocket} handles={events} />);
    simpleMockSocket.on.mock.calls.map((args, i) => {
      expect(args[0]).toEqual(`event-${i}`);
      expect(args[1].name).toEqual(`handle${i}`);
    });
  });

  it('passes event data to child as dataProp', () => {
    // the MockServer/MockSocket setup might work in a standalone function
    const url = 'ws://localhost:8081';
    const MockServer = new Server(url);
    MockServer.on('connection', socket => {
      socket.on('test-target', () => {
        socket.emit('test-this-event', 'event message');
      });
    });
    const MockSocket = new SocketIO(url);
    // https://github.com/thoov/mock-socket/issues/176
    jest.runOnlyPendingTimers();
    MockSocket.removeListener = jest.fn();
    const {container} = render(
      <Socket.On socket={MockSocket} event='test-this-event' dataProp='bloobidy'>
        <TestDummy />
      </Socket.On>
    );
    expect(container.querySelector('#bloobidy').textContent).toBe('undefined');
    MockSocket.emit('test-target')
    expect(container.querySelector('#bloobidy').textContent).toBe('event message');
    MockServer.close();
  });

  it('passes event data to child as dataProp with defaultData', () => {
    // the MockServer/MockSocket setup might work in a standalone function
    const url = 'ws://localhost:8081';
    const MockServer = new Server(url);
    MockServer.on('connection', socket => {
      socket.on('test-target', () => {
        socket.emit('test-this-event', 'event message');
      });
    });
    const MockSocket = new SocketIO(url);
    // https://github.com/thoov/mock-socket/issues/176
    jest.runOnlyPendingTimers();
    MockSocket.removeListener = jest.fn();
    const {container} = render(
      <Socket.On
        socket={MockSocket}
        event='test-this-event'
        dataProp='bloobidy'
        defaultData='Loading...'>
        <TestDummy />
      </Socket.On>
    );
    expect(container.querySelector('#bloobidy').textContent).toBe('Loading...');
    MockSocket.emit('test-target')
    expect(container.querySelector('#bloobidy').textContent).toBe('event message');
    MockServer.close();
  });
});

describe('Socket.Emit Unit Tests', () => {
  it('fires event with payload for onMount', () => {
    const {emit} = simpleMockSocket;
    const onMounts = [{event: 'on-load-event', payload: 'a happy little string'}];
    render(<Socket.Emit socket={simpleMockSocket} onMount={onMounts} />);
    expect(emit).toBeCalledWith('on-load-event', 'a happy little string');
  });

  it('fires only the supplied event on mount with empty payload', () => {
    const {emit} = simpleMockSocket;
    render(<Socket.Emit socket={simpleMockSocket} event='on-load-event' />);
    expect(emit).toBeCalledWith('on-load-event', {});
  });

  it('fires the supplied event on mount with payload', () => {
    const {emit} = simpleMockSocket;
    const load = {data: 'pretty sneaky sis'}
    render(<Socket.Emit socket={simpleMockSocket} event='on-load-event' payload={load} />);
    expect(emit).toBeCalledWith('on-load-event', load);
  });

  it('doesn\'t fire onUpdate when first mounting', () => {
    const {emit} = simpleMockSocket;
    const onUpdates = [{event: 'on-update-event', payload: 'a happy little string'}];
    const {rerender} = render(
      <Socket.Emit socket={simpleMockSocket} onUpdates={onUpdates} />
    );
    expect(emit).not.toBeCalled();
  });

  it('fires event with payload for onUpdate', () => {
    const {emit} = simpleMockSocket;
    const onUpdates = [{event: 'on-update-event', payload: 'a happy little string'}];
    const {rerender} = render(
      <Socket.Emit socket={simpleMockSocket} onUpdates={onUpdates} />
    );
    rerender(<Socket.Emit socket={simpleMockSocket} onUpdates={onUpdates} />);
    expect(emit).toBeCalledWith('on-update-event', 'a happy little string');
  });

  it('wraps a component', () => {
    const { container } = render(
      <Socket.Emit renders={TestDummy} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('fires a single emit with onClick of wrapped component', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit socket={simpleMockSocket}
        renders={TestDummy}
        domEvent='onClick'
        event='button-press-event' />
    );
    expect(emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(emit).toBeCalled();
  });

  it('fires exactly 1 emit with each onClick of wrapped component', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit socket={simpleMockSocket}
        renders={TestDummy}
        domEvent='onClick'
        event='button-press-event' />
    );
    expect(emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(1);
    Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it('fires multiple emissions with onClick of wrapped component', () => {
    const {emit} = simpleMockSocket;
    const emissions = [
      {event: 'clicked-first-event', payload: {}},
      {event: 'clicked-second-event', payload: {}},
      {event: 'clicked-third-event', payload: {}}
    ];
    const {container} = render(
      <Socket.Emit socket={simpleMockSocket}
        renders={TestDummy}
        domEvent='onClick'
        emissions={emissions} />
    );
    expect(emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(emissions.length);
  });

  it('fires emissions and an event if passed with onClick of wrapped component', () => {
    const {emit} = simpleMockSocket;
    const emissions = [
      {event: 'clicked-first-event', payload: {}},
      {event: 'clicked-second-event', payload: {}},
      {event: 'clicked-third-event', payload: {}}
    ];
    const {container} = render(
      <Socket.Emit
        socket={simpleMockSocket}
        renders={TestDummy}
        domEvent='onClick'
        event='say-hello'
        emissions={emissions} />
    );
    expect(emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(4);
  });

  it('fires emissions and exactly 1 event if passed with onClick of wrapped component', () => {
    const {emit} = simpleMockSocket;
    const emissions = [
      {event: 'clicked-first-event', payload: {}},
      {event: 'clicked-second-event', payload: {}},
      {event: 'clicked-third-event', payload: {}}
    ];
    const {container} = render(
      <Socket.Emit
        socket={simpleMockSocket}
        renders={TestDummy}
        domEvent='onClick'
        event='say-hello'
        emissions={emissions} />
    );
    expect(emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(4);
    Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(8);
  });

  it('passes through non-api props to wrapped component', () => {
    const passThrough = {one: 1, two: 2, three: 3};
    const {container} = render(
      <Socket.Emit renders={TestDummy} {...passThrough} />
    );
    expect(container.querySelector('#props-length').textContent).toBe('3')
  });

  it('wraps children and fires a domEvent for them', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit socket={simpleMockSocket} domEvent='onClick' event='hello-work'>
        <TestDummy />
      </Socket.Emit>);
      expect(emit.mock.calls.length).toBe(0);
      Simulate.click(container.firstChild);
      expect(emit.mock.calls.length).toBe(1);
  });

  it('does not override the child handler for the event', () => {
    const {emit} = simpleMockSocket;
    const spy = jest.fn();
    const {container} = render(
      <Socket.Emit socket={simpleMockSocket} domEvent='onClick' event='hello-work'>
        <TestDummy onClick={spy} />
      </Socket.Emit>);
      expect(spy).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(spy).toBeCalled();
  });

  it('handles mouse enter', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit socket={simpleMockSocket} domEvent='onMouseEnter' event='mouse-entered'>
        <TestDummy />
      </Socket.Emit>
    );
    const div = container.querySelector('#test-wrapper');
    // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
    expect(emit.mock.calls.length).toBe(0);
    Simulate.mouseEnter(container.firstChild);
    expect(emit.mock.calls.length).toBe(1);
  });
});
