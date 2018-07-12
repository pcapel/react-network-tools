'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactTestingLibrary = require('react-testing-library');

var _testUtils = require('react-dom/test-utils');

var _index = require('./index');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TestDummy = function (_Component) {
  _inherits(TestDummy, _Component);

  function TestDummy() {
    _classCallCheck(this, TestDummy);

    return _possibleConstructorReturn(this, (TestDummy.__proto__ || Object.getPrototypeOf(TestDummy)).apply(this, arguments));
  }

  _createClass(TestDummy, [{
    key: 'render',
    value: function render() {
      var eventHandlers = _lodash2.default.pick(this.props, _utils.reactEvents);
      return _react2.default.createElement(
        'div',
        Object.assign({ id: 'test-wrapper' }, eventHandlers),
        _react2.default.createElement(
          'span',
          { id: 'props-length' },
          Object.keys(this.props).length
        )
      );
    }
  }]);

  return TestDummy;
}(_react.Component);

var scopedMock = jest.fn();
var mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  removeListener: jest.fn()
};

var MockContext = _react2.default.createContext(mockSocket);

var MockApp = function (_Component2) {
  _inherits(MockApp, _Component2);

  function MockApp() {
    _classCallCheck(this, MockApp);

    return _possibleConstructorReturn(this, (MockApp.__proto__ || Object.getPrototypeOf(MockApp)).apply(this, arguments));
  }

  _createClass(MockApp, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        MockContext.Provider,
        { value: mockSocket },
        this.props.children
      );
    }
  }]);

  return MockApp;
}(_react.Component);

var CtxSocket = {};
CtxSocket.On = (0, _utils.withContext)(_index.Socket.On, MockContext, 'socket');
CtxSocket.Emit = (0, _utils.withContext)(_index.Socket.Emit, MockContext, 'socket');

beforeEach(function () {
  scopedMock.mockReset();
  mockSocket.on.mockReset();
  mockSocket.emit.mockReset();
  mockSocket.removeListener.mockReset();
});

describe('Socket smoke tests', function () {
  it('renders Socket.On without crashing', function () {
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.On, null));
  });

  it('renders Socket.Emit without crashing', function () {
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, null));
  });

  it('renders Socket.Emit with wrapped without crashing', function () {
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { renders: TestDummy }));
  });
});

describe('Socket.On Unit Tests', function () {
  it('registers an event with a handler', function () {
    var call = new scopedMock();
    call.name = 'helloWorldHandler';
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.On, { socket: mockSocket, event: 'hello-world', call: call }));
    expect(mockSocket.on.mock.calls[0][0]).toEqual('hello-world');
    expect(mockSocket.on.mock.calls[0][1].name).toEqual('helloWorldHandler');
  });

  it('registers an event with a handler using context', function () {
    var call = new scopedMock();
    call.name = 'helloWorldHandler';
    (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.On, { event: 'hello-world', call: call })
    ));
    expect(mockSocket.on.mock.calls[0][0]).toEqual('hello-world');
    expect(mockSocket.on.mock.calls[0][1].name).toEqual('helloWorldHandler');
  });

  it('registers handlers for multiple events', function () {
    var calls = _lodash2.default.range(3).map(function (i) {
      return new scopedMock();
    });
    calls.map(function (fn, i) {
      fn.name = 'handle' + i;
    });
    var events = calls.map(function (call, i) {
      return { event: 'event-' + i, use: call };
    });
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.On, { socket: mockSocket, handles: events }));
    mockSocket.on.mock.calls.map(function (args, i) {
      expect(args[0]).toEqual('event-' + i);
      expect(args[1].name).toEqual('handle' + i);
    });
  });

  it('registers handlers for multiple events using context', function () {
    var calls = _lodash2.default.range(3).map(function (i) {
      return new scopedMock();
    });
    calls.map(function (fn, i) {
      fn.name = 'handle' + i;
    });
    var events = calls.map(function (call, i) {
      return { event: 'event-' + i, use: call };
    });
    (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.On, { handles: events })
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
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, onMount: onMounts }));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires event with payload for onMount using context', function () {
    var onMounts = [{ event: 'on-load-event', payload: 'a happy little string' }];
    (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.Emit, { onMount: onMounts })
    ));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires only the supplied event on mount with empty payload', function () {
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, event: 'on-load-event' }));
    expect(mockSocket.emit.mock.calls[0][1]).toEqual({});
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
  });

  it('fires only the supplied event on mount with empty payload using context', function () {
    (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.Emit, { event: 'on-load-event' })
    ));
    expect(mockSocket.emit.mock.calls[0][1]).toEqual({});
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
  });

  it('fires the supplied event on mount with payload', function () {
    var load = { data: 'pretty sneaky sis' };
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, event: 'on-load-event', payload: load }));
    expect(mockSocket.emit.mock.calls[0].length).toBe(2);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toBe(load);
  });

  it('fires the supplied event on mount with payload using context', function () {
    var load = { data: 'pretty sneaky sis' };
    (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.Emit, { event: 'on-load-event', payload: load })
    ));
    expect(mockSocket.emit.mock.calls[0].length).toBe(2);
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-load-event');
    expect(mockSocket.emit.mock.calls[0][1]).toBe(load);
  });

  it('doesn\'t fire onUpdate when first mounting', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, onUpdates: onUpdates })),
        rerender = _render.rerender;

    expect(mockSocket.emit).not.toBeCalled();
  });

  it('doesn\'t fire onUpdate when first mounting using context', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render2 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.Emit, { onUpdates: onUpdates })
    )),
        rerender = _render2.rerender;

    expect(mockSocket.emit).not.toBeCalled();
  });

  it('fires event with payload for onUpdate', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render3 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, onUpdates: onUpdates })),
        rerender = _render3.rerender;

    rerender(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, onUpdates: onUpdates }));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('fires event with payload for onUpdate using context', function () {
    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render4 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.Emit, { onUpdates: onUpdates })
    )),
        rerender = _render4.rerender;

    rerender(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.Emit, { onUpdates: onUpdates })
    ));
    expect(mockSocket.emit.mock.calls[0][0]).toEqual('on-update-event');
    expect(mockSocket.emit.mock.calls[0][1]).toEqual('a happy little string');
  });

  it('wraps a component', function () {
    var _render5 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { renders: TestDummy })),
        container = _render5.container;

    return (0, _reactTestingLibrary.wait)(function () {
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  it('fires a single emit with onClick of wrapped component', function () {
    var _render6 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'button-press-event' })),
        container = _render6.container;

    expect(mockSocket.emit).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit).toBeCalled();
  });

  it('fires a single emit with onClick of wrapped component using context', function () {
    var _render7 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'button-press-event' })),
        container = _render7.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('fires multiple emissions with onClick of wrapped component', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render8 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', emissions: emissions })),
        container = _render8.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(3);
  });

  it('fires multiple emissions with onClick of wrapped component using context', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render9 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', emissions: emissions })),
        container = _render9.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(3);
  });

  it('fires emissions and an event if passed with onClick of wrapped component', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render10 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'say-hello', emissions: emissions })),
        container = _render10.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(4);
  });

  it('fires emissions and an event if passed with onClick of wrapped component using context', function () {
    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render11 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: mockSocket, renders: TestDummy, domEvent: 'onClick', event: 'say-hello', emissions: emissions })),
        container = _render11.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(4);
  });

  it('passes through non-api props to wrapped component', function () {
    var passThrough = { one: 1, two: 2, three: 3 };

    var _render12 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, Object.assign({ renders: TestDummy }, passThrough))),
        container = _render12.container;

    expect(container.querySelector('#props-length').textContent).toBe('3');
  });

  it('passes through non-api props to wrapped component using context', function () {
    var passThrough = { one: 1, two: 2, three: 3 };

    var _render13 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, Object.assign({ renders: TestDummy }, passThrough))),
        container = _render13.container;

    expect(container.querySelector('#props-length').textContent).toBe('3');
  });

  it('wraps children and fires a domEvent for them', function () {
    var _render14 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render14.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('wraps children and fires a domEvent for them using context', function () {
    var _render15 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render15.container;

    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('does not override the child handler for the event', function () {
    var spy = jest.fn();

    var _render16 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      _react2.default.createElement(TestDummy, { onClick: spy })
    )),
        container = _render16.container;

    expect(spy).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(spy).toBeCalled();
  });

  it('does not override the child handler for the event using context', function () {
    var spy = jest.fn();

    var _render17 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: mockSocket, domEvent: 'onClick', event: 'hello-work' },
      _react2.default.createElement(TestDummy, { onClick: spy })
    )),
        container = _render17.container;

    expect(spy.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(spy.mock.calls.length).toBe(1);
  });

  it('handles mouse enter', function () {
    var _render18 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: mockSocket, domEvent: 'onMouseEnter', event: 'mouse-entered' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render18.container;

    var div = container.querySelector('#test-wrapper');
    // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.mouseEnter(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });

  it('handles mouse enter using context', function () {
    var _render19 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: mockSocket, domEvent: 'onMouseEnter', event: 'mouse-entered' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render19.container;

    var div = container.querySelector('#test-wrapper');
    // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
    expect(mockSocket.emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.mouseEnter(container.firstChild);
    expect(mockSocket.emit.mock.calls.length).toBe(1);
  });
});