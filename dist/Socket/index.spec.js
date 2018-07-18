'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactTestingLibrary = require('react-testing-library');

var _testUtils = require('react-dom/test-utils');

var _mockSocket = require('mock-socket');

var _index = require('./index');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO: get rid of the "with context" tests, they're dumb and not needed

// https://github.com/thoov/mock-socket/issues/176
jest.useFakeTimers();

var simpleSpy = jest.fn();

var simpleMockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  removeListener: jest.fn()
};

var MockContext = _react2.default.createContext(simpleMockSocket);

var MockApp = function (_Component) {
  _inherits(MockApp, _Component);

  function MockApp() {
    _classCallCheck(this, MockApp);

    return _possibleConstructorReturn(this, (MockApp.__proto__ || Object.getPrototypeOf(MockApp)).apply(this, arguments));
  }

  _createClass(MockApp, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        MockContext.Provider,
        { value: simpleMockSocket },
        this.props.children
      );
    }
  }]);

  return MockApp;
}(_react.Component);

beforeEach(function () {
  simpleMockSocket.on.mockReset();
  simpleMockSocket.emit.mockReset();
  simpleMockSocket.removeListener.mockReset();
});

var TestDummy = function (_Component2) {
  _inherits(TestDummy, _Component2);

  function TestDummy() {
    _classCallCheck(this, TestDummy);

    return _possibleConstructorReturn(this, (TestDummy.__proto__ || Object.getPrototypeOf(TestDummy)).apply(this, arguments));
  }

  _createClass(TestDummy, [{
    key: 'render',
    value: function render() {
      var _this3 = this;

      var eventHandlers = _lodash2.default.pick(this.props, _utils.reactEvents);
      return _react2.default.createElement(
        'div',
        Object.assign({ id: 'test-wrapper' }, eventHandlers),
        _react2.default.createElement(
          'span',
          { id: 'props-length' },
          Object.keys(this.props).length
        ),
        _react2.default.createElement(
          'ul',
          null,
          Object.keys(this.props).map(function (propName) {
            return _react2.default.createElement(
              'li',
              { key: propName, id: propName },
              _this3.props[propName] + ''
            );
          })
        )
      );
    }
  }]);

  return TestDummy;
}(_react.Component);

var CtxSocket = (0, _utils.withSocketContext)(MockContext);

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
    var call = new simpleSpy();
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.On, { socket: simpleMockSocket, event: 'hello-world', call: call }));
    expect(simpleMockSocket.on).toBeCalledWith('hello-world', call);
  });

  it('registers an event with a handler using context', function () {
    var call = new simpleSpy();
    (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxSocket.On, { event: 'hello-world', call: call })
    ));
    expect(simpleMockSocket.on).toBeCalledWith('hello-world', call);
  });

  it('registers handlers for multiple events', function () {
    var calls = _lodash2.default.range(3).map(function (i) {
      return new simpleSpy();
    });
    calls.map(function (fn, i) {
      fn.name = 'handle' + i;
    });
    var events = calls.map(function (call, i) {
      return { event: 'event-' + i, use: call };
    });
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.On, { socket: simpleMockSocket, handles: events }));
    simpleMockSocket.on.mock.calls.map(function (args, i) {
      expect(args[0]).toEqual('event-' + i);
      expect(args[1].name).toEqual('handle' + i);
    });
  });

  it('passes event data to child as dataProp', function () {
    // the MockServer/MockSocket setup might work in a standalone function
    var url = 'ws://localhost:8081';
    var MockServer = new _mockSocket.Server(url);
    MockServer.on('connection', function (socket) {
      socket.on('test-target', function () {
        socket.emit('test-this-event', 'event message');
      });
    });
    var MockSocket = new _mockSocket.SocketIO(url);
    // https://github.com/thoov/mock-socket/issues/176
    jest.runOnlyPendingTimers();
    MockSocket.removeListener = jest.fn();

    var _render = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.On,
      { socket: MockSocket, event: 'test-this-event', dataProp: 'bloobidy' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render.container;
    // the dataProp is used to create an <li id=props.keys>


    expect(container.querySelector('#bloobidy').textContent).toBe('undefined');
    MockSocket.emit('test-target');
    expect(container.querySelector('#bloobidy').textContent).toBe('event message');
    MockServer.close();
  });

  it('passes event data to child as dataProp with defaultData', function () {
    // the MockServer/MockSocket setup might work in a standalone function
    var url = 'ws://localhost:8082';
    var MockServer = new _mockSocket.Server(url);
    MockServer.on('connection', function (socket) {
      socket.on('test-target', function () {
        socket.emit('test-this-event', 'event message');
      });
    });
    var MockSocket = new _mockSocket.SocketIO(url);
    // https://github.com/thoov/mock-socket/issues/176
    jest.runOnlyPendingTimers();
    // MockSocket doesn't implement this function itself
    MockSocket.removeListener = jest.fn();

    var _render2 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.On,
      {
        socket: MockSocket,
        event: 'test-this-event',
        dataProp: 'bloobidy',
        defaultData: 'Loading...' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render2.container;

    expect(container.querySelector('#bloobidy').textContent).toBe('Loading...');
    MockSocket.emit('test-target');
    expect(container.querySelector('#bloobidy').textContent).toBe('event message');
    MockServer.close();
  });
});

describe('Socket.Emit Unit Tests', function () {
  it('fires event with payload for onMount', function () {
    var emit = simpleMockSocket.emit;

    var onMounts = [{ event: 'on-load-event', payload: 'a happy little string' }];
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket, onMount: onMounts }));
    expect(emit).toBeCalledWith('on-load-event', 'a happy little string');
  });

  it('fires only the supplied event on mount with empty payload', function () {
    var emit = simpleMockSocket.emit;

    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket, event: 'on-load-event' }));
    expect(emit).toBeCalledWith('on-load-event', {});
  });

  it('fires the supplied event on mount with payload', function () {
    var emit = simpleMockSocket.emit;

    var load = { data: 'pretty sneaky sis' };
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket, event: 'on-load-event', payload: load }));
    expect(emit).toBeCalledWith('on-load-event', load);
  });

  it('doesn\'t fire onUpdate when first mounting', function () {
    var emit = simpleMockSocket.emit;

    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render3 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket, onUpdates: onUpdates })),
        rerender = _render3.rerender;

    expect(emit).not.toBeCalled();
  });

  it('fires event with payload for onUpdate', function () {
    var emit = simpleMockSocket.emit;

    var onUpdates = [{ event: 'on-update-event', payload: 'a happy little string' }];

    var _render4 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket, onUpdates: onUpdates })),
        rerender = _render4.rerender;

    rerender(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket, onUpdates: onUpdates }));
    expect(emit).toBeCalledWith('on-update-event', 'a happy little string');
  });

  it('wraps a component', function () {
    var _render5 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { renders: TestDummy })),
        container = _render5.container;

    expect(container.firstChild).toMatchSnapshot();
  });

  it('fires a single emit with onClick of wrapped component', function () {
    var emit = simpleMockSocket.emit;

    var _render6 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket,
      renders: TestDummy,
      domEvent: 'onClick',
      event: 'button-press-event' })),
        container = _render6.container;

    expect(emit).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toBeCalled();
  });

  it('fires exactly 1 emit with each onClick of wrapped component', function () {
    var emit = simpleMockSocket.emit;

    var _render7 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket,
      renders: TestDummy,
      domEvent: 'onClick',
      event: 'button-press-event' })),
        container = _render7.container;

    expect(emit).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(1);
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(2);
  });

  it('fires multiple emissions with onClick of wrapped component', function () {
    var emit = simpleMockSocket.emit;

    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render8 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, { socket: simpleMockSocket,
      renders: TestDummy,
      domEvent: 'onClick',
      emissions: emissions })),
        container = _render8.container;

    expect(emit).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(emissions.length);
  });

  it('fires emissions and an event if passed with onClick of wrapped component', function () {
    var emit = simpleMockSocket.emit;

    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render9 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, {
      socket: simpleMockSocket,
      renders: TestDummy,
      domEvent: 'onClick',
      event: 'say-hello',
      emissions: emissions })),
        container = _render9.container;

    expect(emit).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(4);
  });

  it('fires emissions and exactly 1 event if passed with onClick of wrapped component', function () {
    var emit = simpleMockSocket.emit;

    var emissions = [{ event: 'clicked-first-event', payload: {} }, { event: 'clicked-second-event', payload: {} }, { event: 'clicked-third-event', payload: {} }];

    var _render10 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, {
      socket: simpleMockSocket,
      renders: TestDummy,
      domEvent: 'onClick',
      event: 'say-hello',
      emissions: emissions })),
        container = _render10.container;

    expect(emit).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(4);
    _testUtils.Simulate.click(container.firstChild);
    expect(emit).toHaveBeenCalledTimes(8);
  });

  it('passes through non-api props to wrapped component', function () {
    var passThrough = { one: 1, two: 2, three: 3 };

    var _render11 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Socket.Emit, Object.assign({ renders: TestDummy }, passThrough))),
        container = _render11.container;

    expect(container.querySelector('#props-length').textContent).toBe('3');
  });

  it('wraps children and fires a domEvent for them', function () {
    var emit = simpleMockSocket.emit;

    var _render12 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: simpleMockSocket, domEvent: 'onClick', event: 'hello-work' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render12.container;

    expect(emit.mock.calls.length).toBe(0);
    _testUtils.Simulate.click(container.firstChild);
    expect(emit.mock.calls.length).toBe(1);
  });

  it('does not override the child handler for the event', function () {
    var emit = simpleMockSocket.emit;

    var spy = jest.fn();

    var _render13 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: simpleMockSocket, domEvent: 'onClick', event: 'hello-work' },
      _react2.default.createElement(TestDummy, { onClick: spy })
    )),
        container = _render13.container;

    expect(spy).not.toBeCalled();
    _testUtils.Simulate.click(container.firstChild);
    expect(spy).toBeCalled();
  });

  it('handles mouse enter', function () {
    var emit = simpleMockSocket.emit;

    var _render14 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Socket.Emit,
      { socket: simpleMockSocket, domEvent: 'onMouseEnter', event: 'mouse-entered' },
      _react2.default.createElement(TestDummy, null)
    )),
        container = _render14.container;

    var div = container.querySelector('#test-wrapper');
    // fireEvent(div, new MouseEvent('mouseenter', {bubbles: true, cancelable: true}))
    expect(emit).not.toBeCalled();
    _testUtils.Simulate.mouseEnter(container.firstChild);
    expect(emit).toBeCalled();
  });
});