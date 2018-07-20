import React, { Component } from 'react';
import _ from 'lodash';
import { hasUndefined, WrapWithProps } from '..';

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
      handles,
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

  _apply = (method) => {
    const { socket, event, call, handles, dataProp } = this.props;
    if ( ! _.isUndefined(event) && ! _.isUndefined(call) ) {
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
  }

  fire = (event, payload) => {
    const { socket } = this.props;
    payload = _.isUndefined(payload) ? {} : payload;
    socket.emit(event, payload);
    this.setState({
      previousEmission: [{event: event, payload: payload}],
      hasFired: true
    });
  }

  fires = (emissions) => {
    const { socket } = this.props;
    emissions.map((emission) => {
      socket.emit(emission.event, emission.payload);
      return null;
    });
    this.setState({
      previousEmission: emissions,
      hasFired: true
    });
  }

  componentDidMount() {
    const { renders, domEvent, event, payload, onMount } = this.props;
    if (!_.isEqual(onMount, [])) {
      this.fires(onMount)
    }
    else if (!_.isUndefined(event) && !renders && _.isUndefined(domEvent)) {
      this.fire(event, payload);
    }
  }

  componentDidUpdate(prevProps) {
    const { onUpdates } = this.props;
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
      domEvent,
      payload,
      socket,
      onUpdates,
      onMount,
      emissions,
      children,
      ...passThroughProps
    } = this.props;
    const Wrapped = renders;
    if (!renders && _.isUndefined(children)) {
      return null;
    }
    else if (!_.isUndefined(children)) {
      return (
        <React.Fragment>
        {
          React.Children.map(children, (child) => {
            let childFn = child.props[domEvent];
            if (_.isUndefined(childFn)) {
              childFn = _.noop;
            }
            const eventPackage = this.repackaged(event, payload, emissions);
            return React.cloneElement(child, this.createEvent(domEvent, eventPackage, childFn))
          })
        }
        </React.Fragment>
      );
    }
    const eventPackage = this.repackaged(event, payload, emissions);
    return (
      <Wrapped {...this.createEvent(domEvent, eventPackage)} {...passThroughProps} />
    );
  }

  createEvent = (eventName, fires, childFn=_.noop) => {
    if (_.isUndefined(eventName)) {
      return {};
    }
    return {
      [eventName]: (e) => {
        childFn(e);
        this.fires(fires)
      }
    };
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

export const Socket = {};

On.displayName = 'Socket.On';
Emit.displayName = 'Socket.Emit';

Socket.On = On;
Socket.Emit = Emit;
