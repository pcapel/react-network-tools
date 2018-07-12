import React from 'react';

export var withContext = function withContext(Wrapped, Context, propName) {
  return function (props) {
    return React.createElement(
      Context.Consumer,
      null,
      function (providerValue) {
        var fullProps = Object.assign({}, props);
        fullProps[propName] = providerValue;
        return React.createElement(Wrapped, fullProps);
      }
    );
  };
};

export var urlWithParams = function urlWithParams(URLString, paramsObject) {
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

export var reactEvents = ['onCopy', 'onCut', 'onPaste', 'onKeyDown', 'onKeyPress', 'onKeyUp', 'onFocus', 'onBlur', 'onChange', 'onInput', 'onInvalid', 'onSubmit', 'onClick', 'onContextMenu', 'onDoubleClick', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragExit', 'onDragLeave', 'onDragOver', 'onDragStart', 'onDrop', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver', 'onMouseUp', 'onPointerDown', 'onPointerMove', 'onPointerUp', 'onPointerCancel', 'onGotPointerCapture', 'onLostPointerCapture', 'onPointerEnter', 'onPointerLeave', 'onPointerOver', 'onPointerOut', 'onSelect', 'onScroll', 'onWheel', 'onLoad', 'onError'];