'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reactEvents = exports.urlWithParams = exports.withContext = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var reactEvents = exports.reactEvents = ['onCopy', 'onCut', 'onPaste', 'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onInvalid', 'onSubmit', 'onClick', 'onContextMenu', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerCancel', 'onGotPointerCapture', 'onLostPointerCapture', 'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOut', 'onSelect', 'onScroll', 'onWheel', 'onLoad', 'onError'];