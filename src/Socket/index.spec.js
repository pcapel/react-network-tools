import React, { Component } from 'react';
import _ from 'lodash';
import { render, wait, prettyDOM, fireEvent } from 'react-testing-library';
import { Simulate } from 'react-dom/test-utils';
import { SocketIO, Server } from 'mock-socket';

import { Socket } from './index';
import { withSocketContext, reactEvents } from '..';

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

  it('removes a listener from an event', () => {
    let call = new simpleSpy();
    const {unmount} = render(<Socket.On socket={simpleMockSocket} event='hello-world' call={call} />);
    unmount();
    expect(simpleMockSocket.removeListener).toBeCalledWith('hello-world', call)
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

  it('updates a event when new event is sent in', () => {
    let call = new simpleSpy();
    const {rerender} = render(
      <MockApp>
        <CtxSocket.On event='hello-world' call={call} />
      </MockApp>
    );
    rerender(
      <MockApp>
        <CtxSocket.On event='hello-bob' call={call} />
      </MockApp>
    );
    expect(simpleMockSocket.on).toBeCalledWith('hello-bob', call);
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
    // the dataProp is used to create an <li id=props.keys>
    expect(container.querySelector('#bloobidy').textContent).toBe('undefined');
    MockSocket.emit('test-target')
    expect(container.querySelector('#bloobidy').textContent).toBe('event message');
    MockServer.close();
  });

  it('passes event data to child as dataProp with defaultData', () => {
    // the MockServer/MockSocket setup might work in a standalone function
    const url = 'ws://localhost:8082';
    const MockServer = new Server(url);
    MockServer.on('connection', socket => {
      socket.on('test-target', () => {
        socket.emit('test-this-event', 'event message');
      });
    });
    const MockSocket = new SocketIO(url);
    // https://github.com/thoov/mock-socket/issues/176
    jest.runOnlyPendingTimers();
    // MockSocket doesn't implement this function itself
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

describe('Socket.Emit basic unit tests', () => {
  it('fires event with payload for onMount', () => {
    const {emit} = simpleMockSocket;
    const onMounts = [{
      event: 'on-load-event',
      payload: 'a happy little string',
      acknowledge: _.noop,
    }];
    render(<Socket.Emit socket={simpleMockSocket} onMount={onMounts} />);
    expect(emit).toBeCalledWith('on-load-event', 'a happy little string', _.noop);
  });

  it('fires only the supplied event on mount with empty payload', () => {
    const {emit} = simpleMockSocket;
    render(
      <Socket.Emit socket={simpleMockSocket}
      event='on-load-event'
      acknowledge={_.noop} />
    );
    expect(emit).toBeCalledWith('on-load-event', {}, _.noop);
  });

  it('fires the supplied event on mount with payload', () => {
    const {emit} = simpleMockSocket;
    const load = {data: 'pretty sneaky sis'}
    render(<Socket.Emit socket={simpleMockSocket} event='on-load-event' payload={load} />);
    expect(emit).toBeCalledWith('on-load-event', load, _.noop);
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
    expect(emit).toBeCalledWith('on-update-event', 'a happy little string', _.noop);
  });

  it('calls the acknowledge function with server data', () => {
    // the MockServer/MockSocket setup might work in a standalone function
    const url = 'ws://localhost:8081';
    const MockServer = new Server(url);
    MockServer.on('test-this-event', (load, ack) => {
      ack('some neato testing');
    });
    const MockSocket = new SocketIO(url);
    // https://github.com/thoov/mock-socket/issues/176
    jest.runOnlyPendingTimers();
    MockSocket.removeListener = jest.fn();
    const spy = jest.fn();
    const {container} = render(
      <Socket.Emit socket={MockSocket} event='test-this-event' acknowledge={spy} />
    );
    expect(spy).toBeCalledWith('some neato testing');
    MockServer.close();
  });
});

describe('Socket.Emit as a wrapper unit tests', () => {
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
        onClick
        event='button-press-event' />
    );
    expect(emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(emit).toBeCalled();
  });

  it('fires exactly 1 emit with each onClick of wrapped component', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit onClick
        socket={simpleMockSocket}
        renders={TestDummy}
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
      <Socket.Emit onClick
        socket={simpleMockSocket}
        renders={TestDummy}
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
      <Socket.Emit onClick
        socket={simpleMockSocket}
        renders={TestDummy}
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
      <Socket.Emit onClick
        socket={simpleMockSocket}
        renders={TestDummy}
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

  it('wraps children and fires an event for them', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit onClick
        socket={simpleMockSocket}
        event='hello-work'>
        <TestDummy />
      </Socket.Emit>);
      expect(emit).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(emit).toBeCalled();
  });

  it('does not override the child handler for the event', () => {
    const {emit} = simpleMockSocket;
    const spy = jest.fn();
    const {container} = render(
      <Socket.Emit event='hello-work' onClick
        socket={simpleMockSocket}>
        <TestDummy onClick={spy} />
      </Socket.Emit>);
      expect(spy).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(spy).toBeCalled();
  });

  it('does not swallow a click event', () => {
    const {emit} = simpleMockSocket;
    const spy = jest.fn();
    const bigSpy = jest.fn();
    const BigWrapper = ({children}) => (<div onClick={bigSpy}>{children}</div>);
    const {container} = render(
      <BigWrapper>
        <Socket.Emit event='hello-work' onClick
          socket={simpleMockSocket}>
          <TestDummy onClick={spy} />
        </Socket.Emit>
      </BigWrapper>
    );
      expect(bigSpy).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(bigSpy).toBeCalled();
  });

  it('handles mouse enter', () => {
    const {emit} = simpleMockSocket;
    const {container} = render(
      <Socket.Emit event='mouse-entered' onMouseEnter
        socket={simpleMockSocket}>
        <TestDummy />
      </Socket.Emit>
    );
    expect(emit).not.toBeCalled();
    Simulate.mouseEnter(container.firstChild);
    expect(emit).toBeCalled();
  });
});

describe('Socket.Emit special case DOM event handling', () => {
  describe('Event prop is a single function', () => {
    it('generates a payload from a target event', () => {
      const {emit} = simpleMockSocket;
      const event = 'click-payload-check';
      let payloadSpyReturn;
      const payloadSpy = jest.fn((e) => {payloadSpyReturn = e.target.id});
      const {container} = render(
        <Socket.Emit event={event} onClick={payloadSpy}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      expect(payloadSpy).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(payloadSpy).toBeCalled();
      expect(payloadSpyReturn).toBe('test-wrapper');
    });

    it('fires standard payload for passed event', () => {
      const {emit} = simpleMockSocket;
      const event = 'click-payload-check';
      const payloadSpy = jest.fn();
      const {container} = render(
        <Socket.Emit event={event} payload={{data: 'test'}}
          onClick={payloadSpy}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      Simulate.click(container.firstChild);
      expect(emit.mock.calls[0][1]).toEqual({data: 'test'});
    });

    it('fires event and payload prop, and event with transform payload', () => {
      const {emit} = simpleMockSocket;
      const event = 'click-payload-check';
      const transform = (e) => e.target.id;
      const {container} = render(
        <Socket.Emit event={event} payload='test-payload'
          onClick={transform}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      Simulate.click(container.firstChild);
      expect(emit.mock.calls[0]).toEqual([event, 'test-payload', _.noop]);
      expect(emit.mock.calls[1]).toEqual([event, 'test-wrapper', _.noop]);
    });

    it('fires event, payload, and acknowledge prop, event with transform payload', () => {
      const {emit} = simpleMockSocket;
      const event = 'click-payload-check';
      const transform = (e) => e.target.id;
      const ackWith = (data) => {/*do nothing!*/};
      const {container} = render(
        <Socket.Emit event={event} payload='test-payload'
          onClick={transform} acknowledge={ackWith}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      Simulate.click(container.firstChild);
      expect(emit.mock.calls[0]).toEqual([event, 'test-payload', ackWith]);
      expect(emit.mock.calls[1]).toEqual([event, 'test-wrapper', ackWith]);
    });
  });

  describe('Event prop is an array', () => {
    it('generates a payload from a target event', () => {
      const {emit} = simpleMockSocket;
      const event = 'click-payload-check';
      // a liiiiittle hacky, but it gets the job done until jest releases a windows
      // compatible version that implements toHaveReturnedValue(<value>)
      let payloadSpyReturn;
      const payloadSpy = jest.fn((e) => {payloadSpyReturn = e.target.id});
      const {container} = render(
        <Socket.Emit event={event} onClick={[event, payloadSpy]}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      expect(payloadSpy).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(payloadSpy).toBeCalled();
      expect(payloadSpyReturn).toBe('test-wrapper');
    });

    it('emits event payload with a different event when specified ', () => {
      const {emit} = simpleMockSocket;
      const mainEvent = 'click-payload-check';
      const domEvent = 'click-alternate-event'
      const testTransform = (e) => e.target.id;
      const {container} = render(
        <Socket.Emit event={mainEvent}
          onClick={[domEvent, testTransform]}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      Simulate.click(container.firstChild);
      expect(emit.mock.calls[0]).toEqual([mainEvent, {}, _.noop]);
      expect(emit.mock.calls[1]).toEqual([domEvent, 'test-wrapper', _.noop]);
    });
  });

  describe('Event prop is an object', () => {
    it('generates a payload from a target event', () => {
      const {emit} = simpleMockSocket;
      const event = 'click-payload-check';
      // a liiiiittle hacky, but it gets the job done until jest releases a windows
      // compatible version that implements toHaveReturnedValue(<value>)
      let payloadSpyReturn;
      const payloadSpy = jest.fn((e) => {payloadSpyReturn = e.target.id});
      const {container} = render(
        <Socket.Emit event={event}
          onClick={{event: event, use: payloadSpy}}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      expect(payloadSpy).not.toBeCalled();
      Simulate.click(container.firstChild);
      expect(payloadSpy).toBeCalled();
      expect(payloadSpyReturn).toBe('test-wrapper');
    });

    it('emits event payload with a different event when specified ', () => {
      const {emit} = simpleMockSocket;
      const mainEvent = 'click-payload-check';
      const domEvent = 'click-alternate-event'
      const testTransform = (e) => e.target.id;
      const {container} = render(
        <Socket.Emit event={mainEvent}
          onClick={{event: domEvent, use: testTransform}}
          socket={simpleMockSocket}>
          <TestDummy />
        </Socket.Emit>
      );
      Simulate.click(container.firstChild);
      expect(emit.mock.calls[0]).toEqual([mainEvent, {}, _.noop]);
      expect(emit.mock.calls[1]).toEqual([domEvent, 'test-wrapper', _.noop]);
    });
  });
});
