'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTestingLibrary = require('react-testing-library');

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Child = function Child(props) {
  return _react2.default.createElement(
    'div',
    { 'data-testid': 'prop-holder' },
    Object.keys(props).join(' ')
  );
};

var Holder = function Holder(_ref) {
  var children = _ref.children;

  return _react2.default.createElement(
    _react.Fragment,
    null,
    children
  );
};

describe('WrapWithProps', function () {
  it('maps props onto a top-level child', function () {
    var _render = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.WrapWithProps,
      { inject: { prop1: '', prop2: '' } },
      _react2.default.createElement(Child, null)
    )),
        container = _render.container;

    expect(container.firstChild.textContent).toBe('prop1 prop2');
  });

  it('maps props onto all top-level children', function () {
    var _render2 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.WrapWithProps,
      { inject: { prop1: '', prop2: '' } },
      _react2.default.createElement(Child, null),
      _react2.default.createElement(Child, null),
      _react2.default.createElement(Child, null)
    )),
        container = _render2.container;

    container.querySelectorAll('[data-testid]').forEach(function (el) {
      expect(el.textContent).toBe('prop1 prop2');
    });
  });

  it('doesn\'t do weird things with chilren of children', function () {
    var _render3 = (0, _reactTestingLibrary.render)(_react2.default.createElement(
      _index.WrapWithProps,
      { inject: { prop1: '', prop2: '' } },
      _react2.default.createElement(
        Holder,
        null,
        _react2.default.createElement(
          'div',
          { id: 'test' },
          'Hello'
        )
      )
    )),
        getByText = _render3.getByText;

    expect(getByText('Hello').id).toBe('test');
  });
});

describe('pickEvents', function () {
  it('picks out keys object {k | k in reactEvents} as array of strings', function () {
    var hasKeys = {
      onClick: true,
      onMouseDown: true
    };
    expect((0, _index.pickEvents)(hasKeys)).toEqual(['onClick', 'onMouseDown']);
  });

  it('does not pick unknown keys', function () {
    var hasKeys = {
      onClick: true,
      onMouseDow: true,
      smoobly: true
    };
    expect((0, _index.pickEvents)(hasKeys)).toEqual(['onClick']);
  });
});

describe('createHandler', function () {
  it('creates an object handler for a valid reactEvent', function () {
    var spy = jest.fn();
    var testCalls = [{ func: spy, args: [] }];
    var result = (0, _index.createHandler)('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick();
    expect(spy).toHaveBeenCalled();
  });

  it('calls the calls[i].func with calls[i].args', function () {
    var spy = jest.fn();
    var testCalls = [{ func: spy, args: ['hello', 'world'] }];
    var result = (0, _index.createHandler)('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick();
    expect(spy).toHaveBeenCalledWith('hello', 'world');
  });

  it('allows calls[i].args to be undefined', function () {
    var spy = jest.fn();
    var testCalls = [{ func: spy }];
    var result = (0, _index.createHandler)('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick();
    expect(spy).toHaveBeenCalled();
  });

  it('subs event object for first arg if calls[i].event = true, no args', function () {
    var spy = jest.fn();
    var testCalls = [{ func: spy, event: true }];
    var mockEvent = { hello: 'world' };
    var result = (0, _index.createHandler)('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent);
  });

  it('subs event object for first arg if calls[i].event = true, multiple args', function () {
    var spy = jest.fn();
    var testCalls = [{ func: spy, event: true, args: ['hello', 'world'] }];
    var mockEvent = { hello: 'world' };
    var result = (0, _index.createHandler)('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent, 'hello', 'world');
  });

  it('logs an error for invalid react events', function () {
    console.error = jest.fn();
    var expectMessage = 'Unable to create valid handler using invalidEvent';
    (0, _index.createHandler)('invalidEvent');
    expect(console.error).toBeCalledWith(expectMessage);
  });

  it('returns an empty object for eventName === undefined', function () {
    expect((0, _index.createHandler)(undefined)).toEqual({});
  });
});