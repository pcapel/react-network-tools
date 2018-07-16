'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Socket = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WrapWithProps = function (_Component) {
  _inherits(WrapWithProps, _Component);

  function WrapWithProps() {
    _classCallCheck(this, WrapWithProps);

    return _possibleConstructorReturn(this, (WrapWithProps.__proto__ || Object.getPrototypeOf(WrapWithProps)).apply(this, arguments));
  }

  _createClass(WrapWithProps, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var children = this.props.children;

      return _react2.default.Children.map(children, function (child) {
        return _react2.default.cloneElement(child, _this2.props);
      });
    }
  }]);

  return WrapWithProps;
}(_react.Component);

var On = function (_Component2) {
  _inherits(On, _Component2);

  function On(props) {
    _classCallCheck(this, On);

    var _this3 = _possibleConstructorReturn(this, (On.__proto__ || Object.getPrototypeOf(On)).call(this, props));

    _this3._apply = function (method) {
      var _this3$props = _this3.props,
          socket = _this3$props.socket,
          event = _this3$props.event,
          call = _this3$props.call,
          handles = _this3$props.handles,
          dataProp = _this3$props.dataProp;

      if (!_lodash2.default.isUndefined(event) && !_lodash2.default.isUndefined(call)) {
        socket[method](event, call);
      } else if (!_lodash2.default.isUndefined(handles)) {
        handles.map(function (handle) {
          return socket[method](handle.event, handle.use);
        });
      } else if (!!event && !!dataProp) {
        socket[method](event, _this3.update);
      }
    };

    _this3.update = function (data) {
      _this3.setState({ eventData: data });
    };

    _this3.state = {
      eventData: props.defaultData
    };
    _this3.is = {
      renderer: (0, _utils.hasUndefined)(['event', 'renders'], props),
      wrapper: (0, _utils.hasUndefined)(['event', 'children'], props),
      register: (0, _utils.hasUndefined)(['event', 'call'], props),
      handler: (0, _utils.hasUndefined)(['handles'], props)
    };
    return _this3;
  }

  _createClass(On, [{
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
          WrapWithProps,
          _defineProperty({}, dataProp, this.state.eventData),
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

var Emit = function (_Component3) {
  _inherits(Emit, _Component3);

  function Emit(props) {
    _classCallCheck(this, Emit);

    var _this4 = _possibleConstructorReturn(this, (Emit.__proto__ || Object.getPrototypeOf(Emit)).call(this, props));

    _this4.fire = function (event, payload) {
      var socket = _this4.props.socket;

      payload = _lodash2.default.isUndefined(payload) ? {} : payload;
      socket.emit(event, payload);
      _this4.setState({
        previousEmission: [{ event: event, payload: payload }],
        hasFired: true
      });
    };

    _this4.fires = function (emissions) {
      var socket = _this4.props.socket;

      emissions.map(function (emission) {
        socket.emit(emission.event, emission.payload);
        return null;
      });
      _this4.setState({
        previousEmission: emissions,
        hasFired: true
      });
    };

    _this4.createEvent = function (eventName, fires) {
      var childFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _lodash2.default.noop;

      if (_lodash2.default.isUndefined(eventName)) {
        return {};
      }
      return _defineProperty({}, eventName, function (e) {
        e.preventDefault();
        childFn(e);
        _this4.fires(fires);
      });
    };

    _this4.repackaged = function (event, payload, emissions) {
      var isEvent = !_lodash2.default.isUndefined(event);
      payload = _lodash2.default.isUndefined(payload) ? {} : payload;
      emissions = _lodash2.default.isUndefined(emissions) ? [] : emissions;
      var vals = emissions;
      if (isEvent) {
        vals = [{ event: event, payload: payload }].concat(emissions);
      }
      return vals;
    };

    _this4.state = {
      previousEmission: [],
      hasFired: false
    };
    return _this4;
  }

  _createClass(Emit, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _props2 = this.props,
          renders = _props2.renders,
          domEvent = _props2.domEvent,
          event = _props2.event,
          payload = _props2.payload,
          onMount = _props2.onMount;

      if (!_lodash2.default.isEqual(onMount, [])) {
        this.fires(onMount);
      } else if (!_lodash2.default.isUndefined(event) && !renders && _lodash2.default.isUndefined(domEvent)) {
        this.fire(event, payload);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this5 = this;

      var onUpdates = this.props.onUpdates;

      onUpdates.map(function (emission, i) {
        var prevIndex = prevProps.onUpdates.indexOf(emission);
        if (prevIndex > -1
        // check that the emission is the same as the previous
        // this way any emission changes for the total will trigger a re-fire
        && _lodash2.default.isEqual(emission, prevProps.onUpdates[prevIndex]) && _this5.state.hasFired) {
          return null;
        } else {
          _this5.fire(emission.event, emission.payload);
          return null;
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this6 = this;

      var _props3 = this.props,
          renders = _props3.renders,
          event = _props3.event,
          domEvent = _props3.domEvent,
          payload = _props3.payload,
          socket = _props3.socket,
          onUpdates = _props3.onUpdates,
          onMount = _props3.onMount,
          emissions = _props3.emissions,
          children = _props3.children,
          passThroughProps = _objectWithoutProperties(_props3, ['renders', 'event', 'domEvent', 'payload', 'socket', 'onUpdates', 'onMount', 'emissions', 'children']);

      var Wrapped = renders;
      if (!renders && _lodash2.default.isUndefined(children)) {
        return null;
      } else if (!_lodash2.default.isUndefined(children)) {
        return _react2.default.createElement(
          _react2.default.Fragment,
          null,
          _react2.default.Children.map(children, function (child) {
            var childFn = child.props[domEvent];
            if (_lodash2.default.isUndefined(childFn)) {
              childFn = _lodash2.default.noop;
            }
            return _react2.default.cloneElement(child, _this6.createEvent(domEvent, _this6.repackaged(event, payload, emissions), childFn));
          })
        );
      }
      var eventPackage = this.repackaged(event, payload, emissions);
      return _react2.default.createElement(Wrapped, Object.assign({}, this.createEvent(domEvent, eventPackage), passThroughProps));
    }
  }]);

  return Emit;
}(_react.Component);

Emit.defaultProps = {
  onMount: [],
  onUpdates: [],
  renders: false
};

var Socket = exports.Socket = {};

Socket.On = On;
Socket.Emit = Emit;