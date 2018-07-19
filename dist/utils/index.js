'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reactEvents = exports.hasUndefined = exports.urlWithParams = exports.withEndpointContext = exports.withSocketContext = exports.withContext = exports.WrapWithProps = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Socket = require('../Socket');

var _Ajax = require('../Ajax');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WrapWithProps = exports.WrapWithProps = function WrapWithProps(_ref) {
  var inject = _ref.inject,
      children = _ref.children;

  return _react2.default.Children.map(children, function (child) {
    return _react2.default.cloneElement(child, inject);
  });
};

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