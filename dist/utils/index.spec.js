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