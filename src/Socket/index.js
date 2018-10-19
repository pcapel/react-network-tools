import React, {Component} from 'react';
import _ from 'lodash';

import {
  hasUndefined,
  WrapWithProps,
  createHandler,
  pickEvents
} from '..';

class On extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventData: props.defaultData
    }
    this.is = {
      renderer: hasUndefined(['event', 'renders'], props),
      wrapper: hasUndefined(['event', 'children'], props),
      register: hasUndefined(['event', 'call'], props),
      handler: hasUndefined(['handles'], props)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.event !== nextProps.event) {
      this._apply('removeListener');
      // optionally pass in the event to register
      this._apply('on', nextProps.event);
    }
    return true;
  }

  componentDidMount() {
    this._apply('on');
  }

  componentWillUnmount() {
    this._apply('removeListener');
  }

  render() {
    const {
      children,
      defaultData,
      socket,
      event,
      renders,
      dataProp,
      call,
      handles, // can handles register multiple funcitons against a single event?
      ...passThroughProps
    } = this.props;
    if (this.is.handler || this.is.register) {
      return null;
    }
    else if (this.is.wrapper) {
      return (
        <WrapWithProps inject={{[dataProp]: this.state.eventData}}>
          {children}
        </WrapWithProps>
      );
    } else if (this.is.renderer) {
      const Wrapped = renders;
      return (
        <Wrapped {...{[dataProp]: this.state.eventData}} {...passThroughProps} />
      );
    } else {
      return null;
    }
  }

  _apply = (method, outsideEvent) => {
    const { socket, event, call, handles, dataProp } = this.props;
    if ( ! _.isUndefined(outsideEvent) ) {
      socket[method](outsideEvent, call);
    } else if ( ! _.isUndefined(event) && ! _.isUndefined(call) ) {
      socket[method](event, call);
    } else if ( ! _.isUndefined(handles) ) {
      handles.map(handle => socket[method](handle.event, handle.use));
    } else if (!!event && !!dataProp) {
      socket[method](event, this.update)
    }
  }

  update = (data) => {
    this.setState({eventData: data});
  }
}

class Emit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previousEmission: [],
      hasFired: false
    }
    this.domEventHandlers = [];
  }

  fire = (event, payload) => {
    const {socket} = this.props;
    payload = _.isUndefined(payload) ? {} : payload;
    socket.emit(event, payload);
    this.setState({
      previousEmission: [{event: event, payload: payload}],
      hasFired: true
    });
  }

  fires = (emissions) => {
    const {socket} = this.props;
    emissions.map((emission) => {
      socket.emit(emission.event, emission.payload);
      return null;
    });
    this.setState({
      previousEmission: emissions,
      hasFired: true
    });
  }

  mapHandlers = (domEvent, emissions, firer) => {
    const updatedEmissions = Object.assign([], emissions);
    this.domEventHandlers.map((handler) => {
      const addPayload = handler.transform(domEvent);
      const socketEvent = handler.eventName;
      updatedEmissions.push({event: socketEvent, payload: addPayload})
    });
    firer(updatedEmissions);
  }

  componentDidMount() {
    const {renders, event, payload, onMount} = this.props;
    const domEventName = pickEvents(this.props)[0];
    if (!_.isEqual(onMount, [])) {
      this.fires(onMount)
    }
    else if (!_.isUndefined(event) && !renders && _.isUndefined(domEventName)) {
      this.fire(event, payload);
    }
  }

  componentDidUpdate(prevProps) {
    const {onUpdates} = this.props;
    onUpdates.map((emission, i) => {
      let prevIndex = prevProps.onUpdates.indexOf(emission);
      if (prevIndex > -1
          // check that the emission is the same as the previous
          // this way any emission changes for the total will trigger a re-fire
          && _.isEqual(emission, prevProps.onUpdates[prevIndex])
          && this.state.hasFired) {
            return null;
          }
      else {
        this.fire(emission.event, emission.payload);
        return null;
      }
    });
  }

  render() {
    const {
      renders,
      event,
      payload,
      socket,
      onUpdates,
      onMount,
      emissions,
      children,
      ...passThroughProps
    } = this.props;
    const Wrapped = renders;
    const domEventName = pickEvents(this.props)[0];
    // is one of boolean, object, array,
    const domEventHandle = this.props[domEventName];
    this.attachDOMEventHandle(domEventHandle);
    if (!renders && _.isUndefined(children)) {
      return null;
    }
    else if (!_.isUndefined(children)) {
      return (
        <React.Fragment>
        {
          React.Children.map(children, (child) => {
            let childFn = child.props[domEventName];
            if (_.isUndefined(childFn)) {
              childFn = _.noop;
            }
            const firesEmissions = this.repackaged(event, payload, emissions);
            const eventCalls = [
              {func: this.mapHandlers, event: !!domEventName, args: [firesEmissions, this.fires]},
              {func: childFn, event: true}
            ]
            return React.cloneElement(child, createHandler(domEventName, eventCalls))
          })
        }
        </React.Fragment>
      );
    }
    const firesEmissions = this.repackaged(event, payload, emissions);
    const eventCalls = [{func: this.mapHandlers, event: !!domEventName, args: [firesEmissions, this.fires]}];
    const newProps = Object.assign(passThroughProps, createHandler(domEventName, eventCalls));
    return (
      <Wrapped {...newProps} />
    );
  }

  attachDOMEventHandle = (handle) => {
    if (handle === undefined) {
      return null;
    } else if (Array.isArray(handle)) {
      if (handle.length !== 2) {
        console.error('Array args to DOM events must be 2 values')
      }
      this.domEventHandlers.push({
        eventName: handle[0],
        transform: handle[1]
      });
    } else if (handle.hasOwnProperty('event') && handle.hasOwnProperty('use')) {
      this.domEventHandlers.push({
        eventName: handle.event,
        transform: handle.use
      });
    } else if ((typeof handle) === 'function') {
      this.domEventHandlers.push({
        eventName: this.props.event,
        transform: handle
      });
    }
  }

  repackaged = (event, payload, emissions) => {
    const isEvent = !_.isUndefined(event);
    payload = _.isUndefined(payload) ? {} : payload;
    emissions = _.isUndefined(emissions) ? [] : emissions;
    let vals = emissions;
    if (isEvent) {
      vals = [{event: event, payload: payload}].concat(emissions);
    }
    return vals;
  }
}

Emit.defaultProps = {
  onMount: [],
  onUpdates: [],
  renders: false
}

class RequestResponse extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    const {} = this.props;
    return (
      null
    );
  }
}

export const Socket = {};

On.displayName = 'Socket.On';
Emit.displayName = 'Socket.Emit';
RequestResponse.displayName = 'Socket.RequestResponse';

Socket.On = On;
Socket.Emit = Emit;
Socket.RequestResponse = RequestResponse;
