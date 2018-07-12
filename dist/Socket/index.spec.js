var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import _ from 'lodash';
import { render, wait, prettyDOM, fireEvent } from 'react-testing-library';
import { Simulate } from 'react-dom/test-utils';

import { Socket } from './index';
import { withContext, reactEvents } from '../utils';

var TestDummy = function (_Component) {
  _inherits(TestDummy, _Component);

  function TestDummy() {
    _classCallCheck(this, TestDummy);

    return _possibleConstructorReturn(this, (TestDummy.__proto__ || Object.getPrototypeOf(TestDummy)).apply(this, arguments));
  }

  _createClass(TestDummy, [{
    key: 'render',
    value: function render() {
      var eventHandlers = _.pick(this.props, reactEvents);
      return React.createElement(
        'div',
        Object.assign({ id: 'test-wrapper' }, eventHandlers),
        React.createElement(
          'span',
          { id: 'props-length' },
          Object.keys(this.props).length
        )
      );
    }
  }]);

  return TestDummy;
}(Component);

var scopedMock = jest.fn();
var mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  removeListener: jest.fn()
};

var MockContext = React.createContext(mockSocket);

var MockApp = function (_Component2) {
  _inherits(MockApp, _Component2);

  function MockApp() {
    _classCallCheck(this, MockApp);

    return _possibleConstructorReturn(this, (MockApp.__proto__ || Object.getPrototypeOf(MockApp)).apply(this, arguments));
  }

  _createClass(MockApp, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        MockContext.Provider,
        { value: mockSocket },
        this.props.children
      );
    }
  }]);

  return MockApp;
}(Component);

var CtxSocket = {};
CtxSocket.On = withContext(Socket.On, MockContext, 'socket');
CtxSocket.Emit = withContext(Socket.Emit, MockContext, 'socket');

beforeEach(function () {
  scopedMock.mockReset();
  mockSocket.on.mockReset();
  mockSocket.emit.mockReset();
  mockSocket.removeListener.mockReset();
});

describe('Socket smoke tests', function () {
  it('renders Socket.On without crashing', function () {
    render(React.createElement(Socket.On, null));
  });

  it('renders Socket.Emit without crashing', function () {
    render(React.createElement(Socket.Emit, null));
  });

  it('renders Socket.Emit with wrapped without crashing', function () {
    render(React.createElement(Socket.Emit, { renders: TestDummy }));
  });
});

describe('Socket.On Unit Tests', function () {
  it('registers an event with a handler', function () {
    var call = new scopedMock();
    call.name = 'helloWorldHandler';
    render(React.createElement(Socket.On, { socket: mockSocket, event: 'hello-world', call: call }));
    expect(mockSocket.on.mock.calls[0][0]).toEqual('hello-world');
    expect(mockSocket.on.mock.calls[0][1].name).toEqual('helloWorldHandler');
  });

  it('registers an event with a handler using context', function () {
    var call = new scopedMock();
    call.name = 'helloWorldHandler';
    render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.On, { event: 'hello-world', call: call })
    ));
    expect(mockSocket.on.mock.calls[0][0]).toEqual('hello-world');
    expect(mockSocket.on.mock.calls[0][1].name).toEqual('helloWorldHandler');
  });

  it('registers handlers for multiple events', function () {
    var calls = _.range(3).map(function (i) {
      return new scopedMock();
    });
    calls.map(function (fn, i) {
      fn.name = 'handle' + i;
    });
    var events = calls.map(function (call, i) {
      return { event: 'event-' + i, use: call };
    });
    render(React.createElement(Socket.On, { socket: mockSocket, handles: events }));
    mockSocket.on.mock.calls.map(function (args, i) {
      expect(args[0]).toEqual('event-' + i);
      expect(args[1].name).toEqual('handle' + i);
    });
  });

  it('registers handlers for multiple events using context', function () {
    var calls = _.range(3).map(function (i) {
      return new scopedMock();
    });
    calls.map(function (fn, i) {
      fn.name = 'handle' + i;
    });
    var events = calls.map(function (call, i) {
      return { event: 'event-' + i, use: call };
    });
    render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.On, { handles: events })
    ));
    mockSocket.on.mock.calls.map(function (args, i) {
      expect(args[0]).toEqual('event-' + i);
      expect(args[1].name).toEqual('handle' + i);
    });
  });
});

describe('Socket.Emit Unit Tests', function () {
  it('fires event with payload for onMount', function () {
    var onMounts = [{ event: 'on-load-event', payload: 'a happy little string' }];
    render(React.createElement(Socket.Emit, { socket: mockSocket, onMount: onMounts }));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires event with payload for onMount using context', function () {
    var onMounts = [{ event: 'on-load-event', payload: 'a happy little string' }];
    render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.Emit, { onMount: onMounts })
    ));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires only the supplied event on mount with empty payload', function () {
    render(React.createElement(Socket.Emit, { socket: mockSocket, event: 'on-load-event' }));
    expect(mockSocket.emit.mock.calls[0][1]).toEqual({});
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
  });

  it('fires only the supplied event on mount with empty payload using context', function () {
    render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.Emit, { event: 'on-load-event' })
    ));
    expect(mockSocket.emit.mock.calls[0][1]).toEqual({});
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
  });

  it('fires the supplied event on mount with payload', function () {
    var load = { data: 'pretty sneaky sis' };
    render(React.createElement(Socket.Emit, { socket: mockSocket, event: 'on-load-event', payload: load }));
    expect(mockSocket.emit.mock.calls[0].length).toBe(2);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toBe(load);
  });

  it('fires the supplied event on mount with payload using context', function () {
    var load = { data: 'pretty sneaky sis' };
    render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.Emit, { event: 'on-load-event', payload: load })
    ));
    expect(mockSocket.emit.mock.calls[0].length).toBe(2);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toBe(load);
  });

  it('doesn\'t fire onUpdate when first mounting', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render = render(React.createElement(Socket.Emit, { socket: mockSocket, onUpdates: onUpdates })),
        rerender = _render.rerender;

    expect(mockSocket.emit).not.toBeCalled();
  });

  it('doesn\'t fire onUpdate when first mounting using context', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render2 = render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.Emit, { onUpdates: onUpdates })
    )),
        rerender = _render2.rerender;

    expect(mockSocket.emit).not.toBeCalled();
  });

  it('fires event with payload for onUpdate', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render3 = render(React.createElement(Socket.Emit, { socket: mockSocket, onUpdates: onUpdates })),
        rerender = _render3.rerender;

    rerender(React.createElement(Socket.Emit, { socket: mockSocket, onUpdates: onUpdates }));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires event with payload for onUpdate using context', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render4 = render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.Emit, { onUpdates: onUpdates })
    )),
        rerender = _render4.rerender;

    rerender(React.createElement(
      MockApp,
      null,
      React.createElement(CtxSocket.Emit, { onUpdates: onUpdates })
    ));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('wraps a component', function () {
    var _render5 = render(React.createElement(Socket.Emit, { renders: TestDummy })),
        container = _render5.container;

    return wait(function () {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it('fires a single emit with onClick of wrapped component', function () {
    var _render6 = render(React.createElement(Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'button-press-event' })),
        container = _render6.container;

    expect(mockSocket.emit).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(mockSocket.emit).toBeCalled();
  });

  it('fires a single emit with onClick of wrapped component using context', function () {
    var _render7 = render(React.createElement(Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'button-press-event' })),
        container = _render7.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('fires multiple emissions with onClick of wrapped component', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render8 = render(React.createElement(Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', emissions: emissions })),
        container = _render8.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(3);
  });

  it('fires multiple emissions with onClick of wrapped component using context', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render9 = render(React.createElement(Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', emissions: emissions })),
        container = _render9.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(3);
  });

  it('fires emissions and an event if passed with onClick of wrapped component', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render10 = render(React.createElement(Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'say-hello', emissions: emissions })),
        container = _render10.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(4);
  });

  it('fires emissions and an event if passed with onClick of wrapped component using context', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render11 = render(React.createElement(Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'say-hello', emissions: emissions })),
        container = _render11.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(4);
  });

  it('passes through non-api props to wrapped component', function () {
    var passThrough = { one: 1, two: 2, three: 3 };

    var _render12 = render(React.createElement(Socket.Emit, Object.assign({ renders: TestDummy }, passThrough))),
        container = _render12.container;

    expect(container.querySelector('#props-length').textContent).toBe('3');
  });

  it('passes through non-api props to wrapped component using context', function () {
    var passThrough = { one: 1, two: 2, three: 3 };

    var _render13 = render(React.createElement(Socket.Emit, Object.assign({ renders: TestDummy }, passThrough))),
        container = _render13.container;

    expect(container.querySelector('#props-length').textContent).toBe('3');
  });

  it('wraps children and fires a domEvent for them', function () {
    var _render14 = render(React.createElement(
      Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      React.createElement(TestDummy, null)
    )),
        container = _render14.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('wraps children and fires a domEvent for them using context', function () {
    var _render15 = render(React.createElement(
      Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      React.createElement(TestDummy, null)
    )),
        container = _render15.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('does not override the child handler for the event', function () {
    var spy = jest.fn();

    var _render16 = render(React.createElement(
      Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      React.createElement(TestDummy, { onClick: spy })
    )),
        container = _render16.container;

    expect(spy).not.toBeCalled();
    Simulate.click(container.firstChild);
    expect(spy).toBeCalled();
  });

  it('does not override the child handler for the event using context', function () {
    var spy = jest.fn();

    var _render17 = render(React.createElement(
      Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      React.createElement(TestDummy, { onClick: spy })
    )),
        container = _render17.container;

    expect(spy.mock.calls.length).toBe(0);
    Simulate.click(container.firstChild);
    expect(spy.mock.calls.length).toBe(1);
  });

  it('handles mouse enter', function () {
    var _render18 = render(React.createElement(
      Socket.Emit,
      { socket: mockSocket, domEvent: 'onMouseEnter', event: 'mouse-entered' },
      React.createElement(TestDummy, null)
    )),
        container = _render18.container;

    var div = container.querySelector('#test-wrapper');
    // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.mouseEnter(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('handles mouse enter using context', function () {
    var _render19 = render(React.createElement(
      Socket.Emit,
      { socket: mockSocket, domEvent: 'onMouseEnter', event: 'mouse-entered' },
      React.createElement(TestDummy, null)
    )),
        container = _render19.container;

    var div = container.querySelector('#test-wrapper');
    // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
    expect(mockSocket.emit.mock.calls.length).toBe(0);
    Simulate.mouseEnter(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });
});