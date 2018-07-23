import React, { Component } from 'react';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import _ from 'lodash';
import { render, cleanup, wait, prettyDOM } from 'react-testing-library';

import {Ajax} from './index';
import {withContext, urlWithParams, reactEvents} from '../utils';

const mock = new MockAdapter(axios);

mock.onGet('/').reply(200, {data: []})

describe('Ajax integration tests for axios', () => {
  it('catches a cancellation thrown', () => {
    
  });
});
