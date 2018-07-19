'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Ajax = exports.withLoader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _2 = require('..');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var withLoader = function withLoader(Component, Loader) {
  return function (props) {
    var ajaxData = props.ajaxData,
        through = _objectWithoutProperties(props, ['ajaxData']);

    var isLoading = ajaxData.isLoading;

    return _react2.default.createElement(
      Loader,
      { isLoading: isLoading },
      _react2.default.createElement(Component, through)
    );
  };
};

exports.withLoader = withLoader;

var AjaxWrapper = function (_Component) {
  _inherits(AjaxWrapper, _Component);

  function AjaxWrapper(props) {
    _classCallCheck(this, AjaxWrapper);

    var _this = _possibleConstructorReturn(this, (AjaxWrapper.__proto__ || Object.getPrototypeOf(AjaxWrapper)).call(this, props));

    _initialiseProps.call(_this);

    _this.callback = props.callback;
    _this.state = {
      responseData: props.defaultData,
      isLoading: false,
      isHeld: props.hold,
      isError: false
    };
    return _this;
  }

  _createClass(AjaxWrapper, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var CancelToken = _axios2.default.CancelToken;
      this.source = CancelToken.source();
      var hold = this.props.hold;

      if (!hold) {
        this.send(this.buildURL(this.props));
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var hold = this.props.hold;

      var nextURL = this.buildURL(this.props);
      if (!_lodash2.default.isEqual(this.buildURL(prevProps).toString(), nextURL.toString()) && !hold) {
        this.send(nextURL);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.source.cancel();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          receiver = _props.receiver,
          children = _props.children,
          url = _props.url,
          defaultData = _props.defaultData,
          callback = _props.callback,
          hold = _props.hold,
          target = _props.target,
          path = _props.path,
          endpoints = _props.endpoints,
          showLoading = _props.showLoading,
          params = _props.params,
          loader = _props.loader,
          passThroughProps = _objectWithoutProperties(_props, ['receiver', 'children', 'url', 'defaultData', 'callback', 'hold', 'target', 'path', 'endpoints', 'showLoading', 'params', 'loader']);

      var Receiver = receiver;
      var Render = _react2.default.isValidElement(loader) ? withLoader(Receiver, loader) : Receiver;
      return _react2.default.createElement(Render, Object.assign({ ajaxData: this.state,
        isLoading: this.state.isLoading
      }, passThroughProps));
    }
  }]);

  return AjaxWrapper;
}(_react.Component);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.receive = function (updates) {
    var state = Object.assign({}, _this2.state);
    var nextState = Object.assign(state, updates);
    _this2.setState(nextState);
    _this2.callback(nextState);
  };

  this.send = function (url) {
    _this2.setState({ isLoading: true });
    _axios2.default.get(url, {
      cancelToken: _this2.source.token
    }).then(function (response) {
      return response.data;
    }).then(function (data) {
      return _this2.receive({ responseData: data, isLoading: false, isError: false });
    }).catch(function (data) {
      return _this2.receive({ responseData: data, isLoading: false, isError: true });
    });
  };

  this.buildURL = function (props) {
    var url = props.url,
        target = props.target,
        path = props.path,
        endpoints = props.endpoints,
        params = props.params;

    var urlStr = void 0;
    if (_lodash2.default.isUndefined(url)) {
      urlStr = '' + endpoints[target] + path;
    } else {
      urlStr = url;
    }
    return (0, _2.urlWithParams)(urlStr, params);
  };
};

AjaxWrapper.defaultProps = {
  callback: function callback() {},
  hold: false,
  showLoading: false,
  params: {}
};

AjaxWrapper.displayName = 'Ajax';

var Ajax = exports.Ajax = AjaxWrapper;