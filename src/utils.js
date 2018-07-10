export const urlWithParams = (URLString, paramsObject) => {
  let URLInstance = new URL(URLString);
  if (URLInstance.searchParams === undefined) {
    let params = new URLSearchParams(paramsObject);
    URLInstance.searchParams = params
  } else {
    for (let key in paramsObject) {
      URLInstance.searchParams.append(key, paramsObject[key]);
    }
  }
  return URLInstance;
}

export const reactEvents = [
  'onCopy',
  'onCut',
  'onPaste',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onFocus',
  'onBlur',
  'onChange',
  'onInput',
  'onInvalid',
  'onSubmit',
  'onClick',
  'onContextMenu',
  'onDoubleClick',
  'onDrag',
  'onDragEnd',
  'onDragEnter',
  'onDragExit',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onPointerDown',
  'onPointerMove',
  'onPointerUp',
  'onPointerCancel',
  'onGotPointerCapture',
  'onLostPointerCapture',
  'onPointerEnter' ,
  'onPointerLeave' ,
  'onPointerOver' ,
  'onPointerOut',
  'onSelect',
  'onScroll',
  'onWheel',
  'onLoad' ,
  'onError'
];
