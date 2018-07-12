var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { render, cleanup, wait, prettyDOM } from 'react-testing-library';

import { Ajax } from '.';
import { withContext, urlWithParams } from '../utils';

var TestDummy = function (_Component) {
  _inherits(TestDummy, _Component);

  function TestDummy() {
    _classCallCheck(this, TestDummy);

    return _possibleConstructorReturn(this, (TestDummy.__proto__ || Object.getPrototypeOf(TestDummy)).apply(this, arguments));
  }

  _createClass(TestDummy, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { id: 'test-wrapper' },
        React.createElement(
          'span',
          { id: 'props-data' },
          this.props.ajaxData.responseData
        ),
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

jest.mock('axios');

var testPath = new URL('https://localhost');
var testPath2 = new URL('https://localhost/home');

var mockEndpoints = {
  localhost: testPath.toString()
};

var MockContext = React.createContext(mockEndpoints);

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
        { value: mockEndpoints },
        this.props.children
      );
    }
  }]);

  return MockApp;
}(Component);

var canceller = {
  cancel: jest.fn()
};

axios.CancelToken = {
  source: function source() {
    return canceller;
  }
};

beforeEach(function () {
  canceller.cancel.mockReset();
  axios.get.mockReset();
});

var CtxAjax = withContext(Ajax, MockContext, 'endpoints');

describe('Ajax smoke test', function () {
  it('renders without crashing', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });
    render(React.createElement(Ajax, { receiver: TestDummy, url: testPath, defaultData: 'Loading...',
      callback: _.noop }));
  });
});

describe('Ajax unittests', function () {
  it('performs axios get on componentDidMount', function () {
    axios.get.mockResolvedValueOnce({ data: 'performs axios get on componentDidMount' }).mockResolvedValueOnce({ data: 'performs axios get on componentDidMount' });
    render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _.noop }));
    expect(axios.get.mock.calls.length).toBe(1);
    render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _.noop, showLoading: true }));
    expect(axios.get.mock.calls.length).toBe(2);
  });

  it('cancels a call when unmounted', function () {
    axios.get.mockResolvedValueOnce({ data: 'cancels a call when unmounted' });

    var _render = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _.noop })),
        unmount = _render.unmount;

    return wait(function () {
      unmount();
      expect(canceller.cancel.mock.calls.length).toBe(1);
    });
  });

  it('calls to a url passed in as a string', function () {
    axios.get.mockResolvedValueOnce({ data: 'calls to a url passed in' });

    var _render2 = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _.noop })),
        container = _render2.container;

    expect(axios.get.mock.calls[0][0]).toEqual(urlWithParams('https://localhost/', {}));
  });

  it('calls a url if the props update to a different value', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });

    var _render3 = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', hold: true })),
        rerender = _render3.rerender;

    expect(axios.get.mock.calls.length).toBe(0);
    rerender(React.createElement(Ajax, { receiver: TestDummy, url: testPath2,
      defaultData: 'Loading...' }));
    expect(axios.get.mock.calls.length).toBe(1);
  });

  it('passes the result of a call to its child', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });

    var _render4 = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _.noop })),
        container = _render4.container;

    return wait(function () {
      expect(container.querySelector('#props-data').textContent).toBe('some data');
    });
  });

  it('passes all unknown props to receiver', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });
    var recevierProps = { 1: '', 2: '', 3: '', 4: '' };

    var _render5 = render(React.createElement(Ajax, Object.assign({ receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: _.noop
    }, recevierProps))),
        container = _render5.container;

    return wait(function () {
      // add 2 to the expected length for the ajaxData, and isLoading
      expect(container.querySelector('#props-length').textContent).toBe('6');
    });
  });

  it('calls the supplied callback', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });
    var callback = jest.fn();

    var _render6 = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: callback })),
        container = _render6.container;

    return wait(function () {
      expect(callback.mock.calls.length).toBe(1);
    });
  });

  it('supplies the callback with data as param', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });
    var callback = jest.fn();

    var _render7 = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', callback: callback })),
        container = _render7.container;

    return wait(function () {
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
    axios.get.mockResolvedValueOnce({ data: 'some data' });

    var _render8 = render(React.createElement(Ajax, { receiver: TestDummy, url: testPath,
      defaultData: 'Loading...', hold: true })),
        container = _render8.container;

    expect(axios.get.mock.calls.length).toBe(0);
  });

  it('calls axios get on mount with target and path instead of url', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });

    var _render9 = render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: '',
        defaultData: 'Loading...' })
    )),
        container = _render9.container;

    expect(axios.get.mock.calls.length).toBe(1);
  });

  it('calls to the correct endpoint with target and path', function () {
    axios.get.mockResolvedValueOnce({ data: 'some data' });

    var _render10 = render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: 'home',
        defaultData: 'Loading...' })
    )),
        container = _render10.container;

    expect(axios.get.mock.calls[0][0].toString()).toEqual('https://localhost/home');
  });

  it('calls an endpoint if the path prop updates to a different value', function () {
    axios.get.mockResolvedValue({ data: 'some data' });

    var _render11 = render(React.createElement(
      MockApp,
      null,
      React.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: 'home',
        defaultData: 'Loading...', hold: true })
    )),
        rerender = _render11.rerender;

    expect(axios.get).not.toBeCalled();
    rerender(React.createElement(
      MockApp,
      null,
      React.createElement(CtxAjax, { receiver: TestDummy, target: 'localhost', path: 'other',
        defaultData: 'Loading...', hold: false })
    ));
    expect(axios.get).toBeCalled();
  });

  it('adds params to the url', function () {
    axios.get.mockResolvedValueOnce({ data: 'calls to a url passed in' });

    var _render12 = render(React.createElement(Ajax, { receiver: TestDummy,
      url: testPath, params: { one: 1, two: 2 },
      defaultData: 'Loading...', callback: _.noop })),
        container = _render12.container;

    expect(axios.get.mock.calls[0][0].toString()).toEqual('https://localhost/?one=1&two=2');
  });
});