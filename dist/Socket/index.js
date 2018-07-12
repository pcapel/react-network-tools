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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var On = function (_Component) {
  _inherits(On, _Component);

  function On() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, On);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = On.__proto__ || Object.getPrototypeOf(On)).call.apply(_ref, [this].concat(args))), _this), _this._apply = function (method) {
      var _this$props = _this.props,
          socket = _this$props.socket,
          event = _this$props.event,
          call = _this$props.call,
          handles = _this$props.handles;

      if (!_lodash2.default.isUndefined(event)) {
        socket[method](event, call);
      } else if (!_lodash2.default.isUndefined(handles)) {
        handles.map(function (handle) {
          return socket[method](handle.event, handle.use);
        });
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
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
      return null;
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
      if (isEvent) {
        emissions.push({ event: event, payload: payload });
      }
      return emissions;
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
      var _props = this.props,
          renders = _props.renders,
          domEvent = _props.domEvent,
          event = _props.event,
          payload = _props.payload,
          onMount = _props.onMount;

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

      var _props2 = this.props,
          renders = _props2.renders,
          event = _props2.event,
          domEvent = _props2.domEvent,
          payload = _props2.payload,
          socket = _props2.socket,
          onUpdates = _props2.onUpdates,
          onMount = _props2.onMount,
          emissions = _props2.emissions,
          children = _props2.children,
          passThroughProps = _objectWithoutProperties(_props2, ['renders', 'event', 'domEvent', 'payload', 'socket', 'onUpdates', 'onMount', 'emissions', 'children']);

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
      return _react2.default.createElement(Wrapped, Object.assign({}, this.createEvent(domEvent, this.repackaged(event, payload, emissions)), passThroughProps));
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