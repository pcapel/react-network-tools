'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHandler = exports.pickEvents = exports.reactEvents = exports.hasUndefined = exports.urlWithParams = exports.withEndpointContext = exports.withSocketContext = exports.withContext = exports.WrapWithProps = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Socket = require('../Socket');

var _Ajax = require('../Ajax');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WrapWithProps = exports.WrapWithProps = function WrapWithProps(_ref) {
  var inject = _ref.inject,
      children = _ref.children;

  return _react2.default.Children.map(children, function (child) {
    return _react2.default.cloneElement(child, inject);
  });
};

var withContext = exports.withContext = function withContext(Wrapped, Context, propName) {
  var WithContext = function WithContext(props) {
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
  var wrapped = Wrapped.displayName || Wrapped.name;
  WithContext.displayName = 'withContext(' + wrapped + ')';
  return WithContext;
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
  return _lodash2.default.values(use).every(function (item) {
    return !(item === undefined);
  });
};

var reactEvents = exports.reactEvents = ['onCopy', 'onCut', 'onPaste', 'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onInvalid', 'onSubmit', 'onClick', 'onContextMenu', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerCancel', 'onGotPointerCapture', 'onLostPointerCapture', 'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOut', 'onSelect', 'onScroll', 'onWheel', 'onLoad', 'onError'];

// picks an event name out of props assuming that a boolean exists with the
// event name as the key, eg <EventGrabber onClick /> would return ['onClick']
var pickEvents = exports.pickEvents = function pickEvents(props) {
  return Object.keys(_lodash2.default.pick(props, reactEvents));
};

// creates an object to be used as a spread props on a wrapped component,
// @eventName string event name
// @calls an array of objects following this convention
// {func: <function>, args: <params>}
// the params object will be passed to the function ala func(...params)
// unless the key event: true is set, in which case the params will have the
// event argument replaced with the actual event object.
var createHandler = exports.createHandler = function createHandler(eventName, calls) {
  if (reactEvents.indexOf(eventName) === -1) {
    if (!_lodash2.default.isUndefined(eventName)) {
      console.error('Unable to create valid handler using ' + eventName);
    }
    return {};
  }
  return _defineProperty({}, eventName, function (e) {
    calls.map(function (entry) {
      var args = entry.args || [];
      if (entry.event) {
        args.unshift(e);
      }
      entry.func.apply(entry, _toConsumableArray(args));
    });
  });
};