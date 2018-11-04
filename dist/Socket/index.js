'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Socket = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _2 = require('..');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var On = function (_Component) {
  _inherits(On, _Component);

  function On(props) {
    _classCallCheck(this, On);

    var _this = _possibleConstructorReturn(this, (On.__proto__ || Object.getPrototypeOf(On)).call(this, props));

    _this._apply = function (method, outsideEvent) {
      var _this$props = _this.props,
          socket = _this$props.socket,
          event = _this$props.event,
          call = _this$props.call,
          handles = _this$props.handles,
          dataProp = _this$props.dataProp;

      if (!_lodash2.default.isUndefined(outsideEvent)) {
        socket[method](outsideEvent, call);
      } else if (!_lodash2.default.isUndefined(event) && !_lodash2.default.isUndefined(call)) {
        socket[method](event, call);
      } else if (!_lodash2.default.isUndefined(handles)) {
        handles.map(function (handle) {
          return socket[method](handle.event, handle.use);
        });
      } else if (!!event && !!dataProp) {
        socket[method](event, _this.update);
      }
    };

    _this.update = function (data) {
      _this.setState({ eventData: data });
    };

    _this.state = {
      eventData: props.defaultData
    };
    _this.is = {
      renderer: (0, _2.hasUndefined)(['event', 'renders'], props),
      wrapper: (0, _2.hasUndefined)(['event', 'children'], props),
      register: (0, _2.hasUndefined)(['event', 'call'], props),
      handler: (0, _2.hasUndefined)(['handles'], props)
    };
    return _this;
  }

  _createClass(On, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this.props.event !== nextProps.event) {
        this._apply('removeListener');
        // optionally pass in the event to register
        this._apply('on', nextProps.event);
      }
      return true;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._apply('on');
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._apply('removeListener');
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          defaultData = _props.defaultData,
          socket = _props.socket,
          event = _props.event,
          renders = _props.renders,
          dataProp = _props.dataProp,
          call = _props.call,
          handles = _props.handles,
          passThroughProps = _objectWithoutProperties(_props, ['children', 'defaultData', 'socket', 'event', 'renders', 'dataProp', 'call', 'handles']);

      if (this.is.handler || this.is.register) {
        return null;
      } else if (this.is.wrapper) {
        return _react2.default.createElement(
          _2.WrapWithProps,
          { inject: _defineProperty({}, dataProp, this.state.eventData) },
          children
        );
      } else if (this.is.renderer) {
        var Wrapped = renders;
        return _react2.default.createElement(Wrapped, Object.assign({}, _defineProperty({}, dataProp, this.state.eventData), passThroughProps));
      } else {
        return null;
      }
    }
  }]);

  return On;
}(_react.Component);

var handler = _propTypes2.default.shape({
  event: _propTypes2.default.string,
  use: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object])
});

var renderable = _propTypes2.default.oneOfType([_propTypes2.default.node, _propTypes2.default.element, _propTypes2.default.func]);

On.propTypes = {
  renders: renderable,
  children: _propTypes2.default.element,
  socket: _propTypes2.default.object,
  event: _propTypes2.default.string,
  dataProp: _propTypes2.default.string,
  defaultData: _propTypes2.default.any,
  call: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.object]),
  handles: _propTypes2.default.arrayOf(handler)
};

var Emit = function (_Component2) {
  _inherits(Emit, _Component2);

  function Emit(props) {
    _classCallCheck(this, Emit);

    var _this2 = _possibleConstructorReturn(this, (Emit.__proto__ || Object.getPrototypeOf(Emit)).call(this, props));

    _this2.fire = function (event, payload, ackFunc) {
      var socket = _this2.props.socket;

      payload = _lodash2.default.isUndefined(payload) ? {} : payload;
      socket.emit(event, payload, ackFunc);
      _this2.setState({
        previousEmission: [{ event: event, payload: payload }],
        hasFired: true
      });
    };

    _this2.fires = function (emissions) {
      var socket = _this2.props.socket;

      emissions.map(function (emission) {
        socket.emit(emission.event, emission.payload, emission.acknowledge);
        return null;
      });
      _this2.setState({
        previousEmission: emissions,
        hasFired: true
      });
    };

    _this2.mapHandlers = function (domEvent, emissions, firer) {
      var updatedEmissions = Object.assign([], _this2.ackEnsure(emissions));
      _this2.domEventHandlers.map(function (handler) {
        var addPayload = handler.transform(domEvent);
        var socketEvent = handler.eventName;
        var acknowledge = handler.acknowledge || _this2.props.acknowledge;
        updatedEmissions.push({ event: socketEvent, payload: addPayload, acknowledge: acknowledge });
      });
      firer(updatedEmissions);
    };

    _this2.attachDOMEventHandle = function (handle) {
      if (handle === undefined) {
        return null;
      } else if (Array.isArray(handle)) {
        if (handle.length !== 2) {
          console.error('Array args to DOM events must be 2 values.  ' + 'Using first 2, other values ignored.');
        }
        _this2.domEventHandlers.push({
          eventName: handle[0],
          transform: handle[1]
        });
      } else if (handle.hasOwnProperty('event') && handle.hasOwnProperty('use')) {
        _this2.domEventHandlers.push({
          eventName: handle.event,
          transform: handle.use
        });
      } else if (typeof handle === 'function') {
        _this2.domEventHandlers.push({
          eventName: _this2.props.event,
          transform: handle
        });
      }
    };

    _this2.ackEnsure = function (emissions) {
      var acknowledge = _this2.props.acknowledge;

      emissions.forEach(function (emission) {
        if (_lodash2.default.isUndefined(emission.acknowledge)) {
          emission.acknowledge = acknowledge;
        }
      });
      return emissions;
    };

    _this2.repackaged = function (event, payload, acknowledge, emissions) {
      var isEvent = !_lodash2.default.isUndefined(event);
      payload = _lodash2.default.isUndefined(payload) ? {} : payload;
      emissions = _lodash2.default.isUndefined(emissions) ? [] : emissions;
      // ensure that the emissions has a function value for acknowledge
      _this2.ackEnsure(emissions);
      var vals = emissions;
      if (isEvent) {
        vals = [{ event: event, payload: payload, acknowledge: acknowledge }].concat(emissions);
      }
      return vals;
    };

    _this2.state = {
      previousEmission: [],
      hasFired: false
    };
    _this2.domEventHandlers = [];
    return _this2;
  }

  _createClass(Emit, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props2 = this.props,
          renders = _props2.renders,
          event = _props2.event,
          payload = _props2.payload,
          acknowledge = _props2.acknowledge,
          onMount = _props2.onMount;

      var domEventName = (0, _2.pickEvents)(this.props)[0];
      if (!_lodash2.default.isEqual(onMount, [])) {
        this.fires(onMount);
      } else if (!_lodash2.default.isUndefined(event) && !renders && _lodash2.default.isUndefined(domEventName)) {
        this.fire(event, payload, acknowledge);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this3 = this;

      var _props3 = this.props,
          onUpdates = _props3.onUpdates,
          acknowledge = _props3.acknowledge;

      onUpdates.map(function (emission, i) {
        var prevIndex = prevProps.onUpdates.indexOf(emission);
        if (prevIndex > -1
        // check that the emission is the same as the previous
        // this way any emission changes for the total will trigger a re-fire
        && _lodash2.default.isEqual(emission, prevProps.onUpdates[prevIndex]) && _this3.state.hasFired) {
          return null;
        } else {
          _this3.fire(emission.event, emission.payload,
          // user supplies no func, use default _.noop
          emission.acknowledge || acknowledge);
          return null;
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var _props4 = this.props,
          renders = _props4.renders,
          event = _props4.event,
          payload = _props4.payload,
          socket = _props4.socket,
          onUpdates = _props4.onUpdates,
          onMount = _props4.onMount,
          emissions = _props4.emissions,
          acknowledge = _props4.acknowledge,
          children = _props4.children,
          passThroughProps = _objectWithoutProperties(_props4, ['renders', 'event', 'payload', 'socket', 'onUpdates', 'onMount', 'emissions', 'acknowledge', 'children']);

      var Wrapped = renders;
      var domEventName = (0, _2.pickEvents)(this.props)[0];
      // is one of boolean, object, array,
      var domEventHandle = this.props[domEventName];
      this.attachDOMEventHandle(domEventHandle);
      if (!renders && _lodash2.default.isUndefined(children)) {
        return null;
      } else if (!_lodash2.default.isUndefined(children)) {
        return _react2.default.createElement(
          _react2.default.Fragment,
          null,
          _react2.default.Children.map(children, function (child) {
            var childFn = child.props[domEventName];
            if (_lodash2.default.isUndefined(childFn)) {
              childFn = _lodash2.default.noop;
            }
            var firesEmissions = _this4.repackaged(event, payload, acknowledge, emissions);
            var eventCalls = [{ func: _this4.mapHandlers, event: !!domEventName, args: [firesEmissions, _this4.fires] }, { func: childFn, event: true }];
            return _react2.default.cloneElement(child, (0, _2.createHandler)(domEventName, eventCalls));
          })
        );
      }
      var firesEmissions = this.repackaged(event, payload, acknowledge, emissions);
      var eventCalls = [{
        func: this.mapHandlers,
        event: !!domEventName,
        args: [firesEmissions, this.fires]
      }];
      var newProps = Object.assign(passThroughProps, (0, _2.createHandler)(domEventName, eventCalls));
      return _react2.default.createElement(Wrapped, newProps);
    }
  }]);

  return Emit;
}(_react.Component);

var emissionType = _propTypes2.default.shape({
  event: _propTypes2.default.string,
  payload: _propTypes2.default.any,
  ack: _propTypes2.default.func
});

Emit.defaultProps = {
  onMount: [],
  onUpdates: [],
  acknowledge: _lodash2.default.noop,
  // TODO: using a boolean is causing the proptypes issue, remove?
  renders: false
};

Emit.propTypes = {
  renders: renderable,
  event: _propTypes2.default.string,
  /**
  * payload can be any serializable type
  */
  payload: _propTypes2.default.any,
  socket: _propTypes2.default.object,
  onUpdates: _propTypes2.default.arrayOf(emissionType),
  onMount: _propTypes2.default.arrayOf(emissionType),
  emissions: _propTypes2.default.arrayOf(emissionType),
  acknowledge: _propTypes2.default.func,
  children: _propTypes2.default.element
};

var Socket = exports.Socket = {};

On.displayName = 'Socket.On';
Emit.displayName = 'Socket.Emit';

Socket.On = On;
Socket.Emit = Emit;