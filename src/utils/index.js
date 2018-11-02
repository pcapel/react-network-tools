import React, {Component} from 'react';
import _ from 'lodash';
import {Socket} from '../Socket';
import {Ajax} from '../Ajax';

export const WrapWithProps = ({inject, children}) => {
  return (
    React.Children.map(children, (child) => {
      return React.cloneElement(child, inject);
    })
  );
}

export const withContext = (Wrapped, Context, propName) => {
  const WithContext = props => {
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
  const wrapped = Wrapped.displayName || Wrapped.name;
  WithContext.displayName = `withContext(${wrapped})`;
  return WithContext;
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
  return _.values(use).every(item => !(item === undefined));
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

// picks an event name out of props assuming that a boolean exists with the
// event name as the key, eg <EventGrabber onClick /> would return ['onClick']
export const pickEvents = (props) => {
  return Object.keys(_.pick(props, reactEvents));
}

// creates an object to be used as a spread props on a wrapped component,
// @eventName string event name
// @calls an array of objects following this convention
// {func: <function>, args: <params>}
// the params object will be passed to the function ala func(...params)
// unless the key event: true is set, in which case the params will have the
// event argument replaced with the actual event object.
export const createHandler = (eventName, calls) => {
  if (reactEvents.indexOf(eventName) === -1) {
    if( !_.isUndefined(eventName)) {
      console.error(`Unable to create valid handler using ${eventName}`);
    }
    return {};
  }
  return {
    [eventName]: (e) => {
      calls.map(entry => {
        const args = entry.args || [];
        if (entry.event) {
          args.unshift(e);
        }
        entry.func(...args)
      });
    }
  }
}
