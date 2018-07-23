'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactTestingLibrary = require('react-testing-library');

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
      return _react2.default.createElement(
        'div',
        { id: 'test-wrapper' },
        _react2.default.createElement(
          'span',
          { id: 'props-data' },
          this.props.ajaxData.responseData
        ),
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

jest.mock('axios');

var testPath = new URL('https://localhost');
var testPath2 = new URL('https://localhost/home');

var mockEndpoints = {
  localhost: testPath.toString()
};

var MockContext = _react2.default.createContext(mockEndpoints);

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
        { value: mockEndpoints },
        this.props.children
      );
    }
  }]);

  return MockApp;
}(_react.Component);

var canceller = {
  cancel: jest.fn()
};

_axios2.default.CancelToken = {
  source: function source() {
    return canceller;
  }
};

beforeEach(function () {
  canceller.cancel.mockReset();
  _axios2.default.get.mockReset();
});

var CtxAjax = (0, _utils.withContext)(_index.Ajax, MockContext, 'endpoints');

describe('Ajax smoke test', function () {
  it('renders without crashing', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath, defaultData: 'Loading...',
      callback: _lodash2.default.noop }));
  });
});

describe('Ajax unittests', function () {
  it('performs axios get on componentDidMount', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'performs axios get on componentDidMount' }).mockResolvedValueOnce({ data: 'performs axios get on componentDidMount' });
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _lodash2.default.noop }));
    expect(_axios2.default.get.mock.calls.length).toBe(1);
    (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _lodash2.default.noop }));
    expect(_axios2.default.get.mock.calls.length).toBe(2);
  });

  it('calls the cancel token when unmounted', function () {
    _axios2.default.get.mockResolvedValue({});

    var _render = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _lodash2.default.noop })),
        unmount = _render.unmount,
        container = _render.container;

    return (0, _reactTestingLibrary.wait)(function () {
      unmount();
      expect(canceller.cancel).toBeCalled();
    });
  });

  it('calls to a url passed in as a string', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'calls to a url passed in' });

    var _render2 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _lodash2.default.noop })),
        container = _render2.container;

    expect(_axios2.default.get.mock.calls[0][0]).toEqual((0, _utils.urlWithParams)('https://localhost/', {}));
  });

  it('calls a url if the props update to a different value', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });

    var _render3 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', hold: true })),
        rerender = _render3.rerender;

    expect(_axios2.default.get.mock.calls.length).toBe(0);
    rerender(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath2,
      defaultData: 'Loading...' }));
    expect(_axios2.default.get.mock.calls.length).toBe(1);
  });

  it('passes the result of a call to its child', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });

    var _render4 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _lodash2.default.noop })),
        container = _render4.container;

    return (0, _reactTestingLibrary.wait)(function () {
      expect(container.querySelector('#props-data').textContent).toBe('some data');
    });
  });

  it('passes all unknown props to receiver', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });
    var recevierProps = { 1: '', 2: '', 3: '', 4: '' };

    var _render5 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, Object.assign({ receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _lodash2.default.noop
    }, recevierProps))),
        container = _render5.container;

    return (0, _reactTestingLibrary.wait)(function () {
      // add 2 to the expected length for the ajaxData, and isLoading
      expect(container.querySelector('#props-length').textContent).toBe('6');
    });
  });

  it('calls the supplied callback', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });
    var callback = jest.fn();

    var _render6 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: callback })),
        container = _render6.container;

    return (0, _reactTestingLibrary.wait)(function () {
      expect(callback.mock.calls.length).toBe(1);
    });
  });

  it('supplies the callback with data as param', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });
    var callback = jest.fn();

    var _render7 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: callback })),
        container = _render7.container;

    return (0, _reactTestingLibrary.wait)(function () {
      var _callback$mock$calls$ = callback.mock.calls[0][0],
          responseData = _callback$mock$calls$.responseData,
          isLoading = _callback$mock$calls$.isLoading,
          isError = _callback$mock$calls$.isError,
          url = _callback$mock$calls$.url;

      expect(responseData).toEqual('some data');
      expect(isLoading).toBe(false);
      expect(isError).toBe(false);
    });
  });

  it('holds a call if hold is true', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });

    var _render8 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', hold: true })),
        container = _render8.container;

    expect(_axios2.default.get.mock.calls.length).toBe(0);
  });

  it('calls axios get on mount with target and path instead of url', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });

    var _render9 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: '',
        defaultData: 'Loading...' })
    )),
        container = _render9.container;

    expect(_axios2.default.get).toBeCalled();
  });

  it('calls to the correct endpoint with target and path', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'some data' });

    var _render10 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: 'home',
        defaultData: 'Loading...' })
    )),
        container = _render10.container;

    expect(_axios2.default.get.mock.calls[0][0].toString()).toEqual('https://localhost/home');
  });

  it('calls an endpoint if the path prop updates to a different value', function () {
    _axios2.default.get.mockResolvedValue({ data: 'some data' });

    var _render11 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: 'home',
        defaultData: 'Loading...', hold: true })
    )),
        rerender = _render11.rerender;

    expect(_axios2.default.get).not.toBeCalled();
    rerender(_react2.default.createElement(
      MockApp,
      null,
      _react2.default.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: 'other',
        defaultData: 'Loading...', hold: false })
    ));
    expect(_axios2.default.get).toBeCalled();
  });

  it('adds params to the url', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'calls to a url passed in' });

    var _render12 = (0, _reactTestingLibrary.render)(_react2.default.createElement(_index.Ajax, { receiver: TestDummy,
      url: testPath, params: { one: 1, two: 2 },
      defaultData: 'Loading...', callback: _lodash2.default.noop })),
        container = _render12.container;

    expect(_axios2.default.get.mock.calls[0][0].toString()).toEqual('https://localhost/?one=1&two=2');
  });

  it('renders children', function () {
    // hold the call so you don't have to mock the resolved value
    var _render13 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Ajax,
      { url: testPath, hold: true },
      _react2.default.createElement('div', { 'data-testid': 'hello' })
    )),
        container = _render13.container;

    expect(container.querySelector('[data-testid]')).not.toBeNull();
  });

  it('fires a request on the desired event bubbling from child', function () {
    _axios2.default.get.mockResolvedValueOnce({ data: 'calls to a url passed in' });

    var _render14 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.Ajax,
      { url: testPath,
        onClick: true },
      _react2.default.createElement('div', { 'data-testid': 'hello' })
    )),
        container = _render14.container;

    expect(_axios2.default.get).toBeCalled();
  });
});