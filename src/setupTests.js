import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { cleanup } from 'react-testing-library';

jest.mock('axios');

class TestDummy extends Component {
  render() {
    return (
      <div id='test-wrapper'>
        <span id='props-data'>{ this.props.ajaxData.responseData }</span>
        <span id='props-length'>{ Object.keys(this.props).length }</span>
      </div>);
  }
}

const path = new URL('https://localhost');
const path2 = new URL('https://localhost/home')


const canceller = {
  cancel: jest.fn()
}

axios.CancelToken = {
  source: () => canceller
}

beforeEach(() => {
  canceller.cancel.mockReset();
  axios.get.mockReset();
});

afterEach(cleanup);
