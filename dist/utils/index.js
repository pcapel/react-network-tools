'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reactEvents = exports.hasUndefined = exports.urlWithParams = exports.withEndpointContext = exports.withSocketContext = exports.withContext = exports.WrapWithProps = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Socket = require('../Socket');

var _Ajax = require('../Ajax');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WrapWithProps = exports.WrapWithProps = function (_Component) {
  _inherits(WrapWithProps, _Component);

  function WrapWithProps() {
    _classCallCheck(this, WrapWithProps);

    return _possibleConstructorReturn(this, (WrapWithProps.__proto__ || Object.getPrototypeOf(WrapWithProps)).apply(this, arguments));
  }

  _createClass(WrapWithProps, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var children = this.props.children;

      return _react2.default.Children.map(children, function (child) {
        return _react2.default.cloneElement(child, _this2.props, child.props.children);
      });
    }
  }]);

  return WrapWithProps;
}(_react.Component);

var withContext = exports.withContext = function withContext(Wrapped, Context, propName) {
  return function (props) {
    return _react2.default.createElement(
      Context.Consumer,
      null,
      function (providerValue) {
        var fullProps = Object.assign({}, props);
        fullProps[propName] = providerValue;
        return _react2.default.createElement(Wrapped, fullProps);
      }
    );
  };
};

var withSocketContext = exports.withSocketContext = function withSocketContext(Context) {
  var contextualized = {};
  contextualized.On = withContext(_Socket.Socket.On, Context, 'socket');
  contextualized.Emit = withContext(_Socket.Socket.Emit, Context, 'socket');
  return contextualized;
};

var withEndpointContext = exports.withEndpointContext = function withEndpointContext(Context) {
  return withContext(_Ajax.Ajax, Context, 'endpoints');
};

var urlWithParams = exports.urlWithParams = function urlWithParams(URLString, paramsObject) {
  var URLInstance = new URL(URLString);
  if (URLInstance.searchParams === undefined) {
    var params = new URLSearchParams(paramsObject);
    URLInstance.searchParams = params;
  } else {
    for (var key in paramsObject) {
      URLInstance.searchParams.append(key, paramsObject[key]);
    }
  }
  return URLInstance;
};

var hasUndefined = exports.hasUndefined = function hasUndefined(select, object) {
  var use = {};
  select.map(function (key) {
    return _lodash2.default.merge(use, _defineProperty({}, key, object[key]));
  });
  return Object.values(use).every(function (item) {
    return !(item === undefined);
  });
};

var reactEvents = exports.reactEvents = ['onCopy', 'onCut', 'onPaste', 'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onInvalid', 'onSubmit', 'onClick', 'onContextMenu', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerCancel', 'onGotPointerCapture', 'onLostPointerCapture', 'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOut', 'onSelect', 'onScroll', 'onWheel', 'onLoad', 'onError'];