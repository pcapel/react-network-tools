const React, { Component } = require('react');
const _ = require('lodash');

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
  onUpdates: [],
  renders: false
}

export const Socket = {};

Socket.On = On;
Socket.Emit = Emit;
