import React, { Component } from 'react';
import _ from 'lodash';

export const withSocket = (Component, Context) => {
  return props => {
    return (
      <Context.Consumer>
        {ctx => (<Component socket={ctx.socket} {...props} />)}
      </Context.Consumer>
    );
  }
}


class On extends Component {
  _apply = (method) => {
    const { socket, event, call, handles } = this.props;
    if ( ! _.isUndefined(event) ) {
      socket[method](event, call);
    } else if ( ! _.isUndefined(handles) ) {
      handles.map(handle => socket[method](handle.event, handle.use));
    }
  }

  componentDidMount() {
    this._apply('on');
  }

  componentWillUnmount() {
    this._apply('removeListener');
  }

  render() {
    return null;
  }
}

class Emit extends Component {
  fire = (event, payload) => {
    const { socket } = this.props;
    payload = _.isUndefined(payload) ? {} : payload;
    socket.emit(event, payload);
  }

  fires = (emissions) => {
    const { socket } = this.props;
    emissions.map((emission) => {
      socket.emit(emission.event, emission.payload);
      return null;
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
    const { onUpdate, force } = this.props;
    onUpdate.map((emission, i) => {
      let prevIndex = prevProps.onUpdate.indexOf(emission);
      if (prevIndex > -1
          && _.isEqual(emission, prevProps.onUpdate[prevIndex])
          && !force) {
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
      onUpdate,
      onMount,
      force,
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
            return React.cloneElement(child, this.createEvent(domEvent, this.repackaged(event, payload, emissions), childFn))
          })
        }
        </React.Fragment>
      );
    }
    return (
      <Wrapped {...this.createEvent(domEvent, this.repackaged(event, payload, emissions))}
        {...passThroughProps}>
      </Wrapped>
    );
  }

  createEvent = (eventName, fires, childFn=_.noop) => {
    if (_.isUndefined(eventName)) {
      return {};
    }
    return {
      [eventName]: (e) => {
        e.preventDefault();
        childFn(e);
        this.fires(fires)
      }
    };
  }

  repackaged = (event, payload, emissions) => {
    const isEvent = !_.isUndefined(event);
    payload = _.isUndefined(payload) ? {} : payload;
    emissions = _.isUndefined(emissions) ? [] : emissions;
    if (isEvent) {
      emissions.push({event: event, payload: payload});
    }
    return emissions;
  }
}

Emit.defaultProps = {
  onMount: [],
  onUpdate: [],
  renders: false,
  force: false
}

export const Socket = {};

Socket.On = On;
Socket.Emit = Emit;