import React, {Component} from 'react';
import PropTypes from 'prop-types';
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

const handler = PropTypes.shape({
  event: PropTypes.string,
  use: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ])
});

const renderable = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.element,
  PropTypes.func
]);

On.propTypes = {
  renders: renderable,
  children: PropTypes.element,
  socket: PropTypes.object,
  event: PropTypes.string,
  dataProp: PropTypes.string,
  defaultData: PropTypes.any,
  call: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object
  ]),
  handles: PropTypes.arrayOf(handler)
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

  fire = (event, payload, ackFunc) => {
    const {socket} = this.props;
    payload = _.isUndefined(payload) ? {} : payload;
    socket.emit(event, payload, ackFunc);
    this.setState({
      previousEmission: [{event: event, payload: payload}],
      hasFired: true
    });
  }

  fires = (emissions) => {
    const {socket} = this.props;
    emissions.map((emission) => {
      socket.emit(emission.event, emission.payload, emission.acknowledge);
      return null;
    });
    this.setState({
      previousEmission: emissions,
      hasFired: true
    });
  }

  mapHandlers = (domEvent, emissions, firer) => {
    const updatedEmissions = Object.assign([], this.ackEnsure(emissions));
    this.domEventHandlers.map((handler) => {
      const addPayload = handler.transform(domEvent);
      const socketEvent = handler.eventName;
      const acknowledge = handler.acknowledge || this.props.acknowledge;
      updatedEmissions.push({event: socketEvent, payload: addPayload, acknowledge})
    });
    firer(updatedEmissions);
  }

  componentDidMount() {
    const {renders, event, payload, acknowledge, onMount} = this.props;
    const domEventName = pickEvents(this.props)[0];
    if (!_.isEqual(onMount, [])) {
      this.fires(onMount)
    }
    else if (!_.isUndefined(event) && !renders && _.isUndefined(domEventName)) {
      this.fire(event, payload, acknowledge);
    }
  }

  componentDidUpdate(prevProps) {
    const {onUpdates, acknowledge} = this.props;
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
        this.fire(
          emission.event,
          emission.payload,
          // user supplies no func, use default _.noop
          emission.acknowledge || acknowledge
        );
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
      acknowledge,
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
            const firesEmissions = this.repackaged(event, payload, acknowledge, emissions);
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
    const firesEmissions = this.repackaged(event, payload, acknowledge, emissions);
    const eventCalls = [{
      func: this.mapHandlers,
      event: !!domEventName,
      args: [firesEmissions, this.fires]
    }];
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
        console.error('Array args to DOM events must be 2 values.  ' +
                      'Using first 2, other values ignored.'
                      )
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

  ackEnsure = (emissions) => {
    const {acknowledge} = this.props;
    emissions.forEach((emission) => {
      if (_.isUndefined(emission.acknowledge)) {
        emission.acknowledge = acknowledge;
      }
    });
    return emissions;
  }

  repackaged = (event, payload, acknowledge, emissions) => {
    const isEvent = !_.isUndefined(event);
    payload = _.isUndefined(payload) ? {} : payload;
    emissions = _.isUndefined(emissions) ? [] : emissions;
    // ensure that the emissions has a function value for acknowledge
    this.ackEnsure(emissions);
    let vals = emissions;
    if (isEvent) {
      vals = [{event, payload, acknowledge}].concat(emissions);
    }
    return vals;
  }
}

const emissionType = PropTypes.shape({
  event: PropTypes.string,
  payload: PropTypes.any,
  ack: PropTypes.func
});

Emit.defaultProps = {
  onMount: [],
  onUpdates: [],
  acknowledge: _.noop,
  // TODO: using a boolean is causing the proptypes issue, remove?
  renders: false
}

Emit.propTypes = {
  renders: renderable,
  event: PropTypes.string,
  /**
  * payload can be any serializable type
  */
  payload: PropTypes.any,
  socket: PropTypes.object,
  onUpdates: PropTypes.arrayOf(emissionType),
  onMount: PropTypes.arrayOf(emissionType),
  emissions: PropTypes.arrayOf(emissionType),
  acknowledge: PropTypes.func,
  children: PropTypes.element,
}

export const Socket = {};

On.displayName = 'Socket.On';
Emit.displayName = 'Socket.Emit';

Socket.On = On;
Socket.Emit = Emit;
