import React, {Component} from 'react';
import _ from 'lodash';
import { Socket } from '../Socket';
import { Ajax } from '../Ajax';

export class WrapWithProps extends Component {
  render() {
    const {inject, children} = this.props;
    return (
      React.Children.map(children, (child) => {
        return React.cloneElement(child, inject);
      })
    );
  }
}

export const withContext = (Wrapped, Context, propName) => {
  return props => {
    return (
      <Context.Consumer>
        {
          providerValue => {
            const fullProps = Object.assign({}, props);
            fullProps[propName] = providerValue;
            return (<Wrapped {...fullProps} />);
          }
        }
      </Context.Consumer>
    );
  }
}

export const withSocketContext = (Context) => {
  const contextualized = {};
  contextualized.On = withContext(Socket.On, Context, 'socket');
  contextualized.Emit = withContext(Socket.Emit, Context, 'socket');
  return contextualized;
}

export const withEndpointContext = (Context) => {
  return withContext(Ajax, Context, 'endpoints');
}

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

export const hasUndefined = (select, object) => {
  let use = {};
  select.map(key => _.merge(use, {[key]: object[key]}))
  return Object.values(use).every(item => !(item === undefined));
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
