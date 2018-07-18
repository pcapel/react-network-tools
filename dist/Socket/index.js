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

    _this._apply = function (method) {
      var _this$props = _this.props,
          socket = _this$props.socket,
          event = _this$props.event,
          call = _this$props.call,
          handles = _this$props.handles,
          dataProp = _this$props.dataProp;

      if (!_lodash2.default.isUndefined(event) && !_lodash2.default.isUndefined(call)) {
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

var Emit = function (_Component2) {
  _inherits(Emit, _Component2);

  function Emit(props) {
    _classCallCheck(this, Emit);

    var _this2 = _possibleConstructorReturn(this, (Emit.__proto__ || Object.getPrototypeOf(Emit)).call(this, props));

    _this2.fire = function (event, payload) {
      var socket = _this2.props.socket;

      payload = _lodash2.default.isUndefined(payload) ? {} : payload;
      socket.emit(event, payload);
      _this2.setState({
        previousEmission: [{ event: event, payload: payload }],
        hasFired: true
      });
    };

    _this2.fires = function (emissions) {
      var socket = _this2.props.socket;

      emissions.map(function (emission) {
        socket.emit(emission.event, emission.payload);
        return null;
      });
      _this2.setState({
        previousEmission: emissions,
        hasFired: true
      });
    };

    _this2.createEvent = function (eventName, fires) {
      var childFn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _lodash2.default.noop;

      if (_lodash2.default.isUndefined(eventName)) {
        return {};
      }
      return _defineProperty({}, eventName, function (e) {
        e.preventDefault();
        childFn(e);
        _this2.fires(fires);
      });
    };

    _this2.repackaged = function (event, payload, emissions) {
      var isEvent = !_lodash2.default.isUndefined(event);
      payload = _lodash2.default.isUndefined(payload) ? {} : payload;
      emissions = _lodash2.default.isUndefined(emissions) ? [] : emissions;
      var vals = emissions;
      if (isEvent) {
        vals = [{ event: event, payload: payload }].concat(emissions);
      }
      return vals;
    };

    _this2.state = {
      previousEmission: [],
      hasFired: false
    };
    return _this2;
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
      var _this3 = this;

      var onUpdates = this.props.onUpdates;

      onUpdates.map(function (emission, i) {
        var prevIndex = prevProps.onUpdates.indexOf(emission);
        if (prevIndex > -1
        // check that the emission is the same as the previous
        // this way any emission changes for the total will trigger a re-fire
        && _lodash2.default.isEqual(emission, prevProps.onUpdates[prevIndex]) && _this3.state.hasFired) {
          return null;
        } else {
          _this3.fire(emission.event, emission.payload);
          return null;
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

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
            return _react2.default.cloneElement(child, _this4.createEvent(domEvent, _this4.repackaged(event, payload, emissions), childFn));
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