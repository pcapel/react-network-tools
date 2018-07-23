'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _axiosMockAdapter = require('axios-mock-adapter');

var _axiosMockAdapter2 = _interopRequireDefault(_axiosMockAdapter);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactTestingLibrary = require('react-testing-library');

var _index = require('./index');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mock = new _axiosMockAdapter2.default(_axios2.default);

mock.onGet('/').reply(200, { data: [] });

describe('Ajax integration tests for axios', function () {
  it('catches a cancellation thrown', function () {});
});