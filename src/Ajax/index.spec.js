import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { render, cleanup, wait, prettyDOM } from 'react-testing-library';

import { Ajax } from '.';
import { withContext, urlWithParams, reactEvents } from '..';

class TestDummy extends Component {
  render() {
    return (
      <div id='test-wrapper'>
        <span id='props-data'>{ this.props.ajaxData.responseData }</span>
        <span id='props-length'>{ Object.keys(this.props).length }</span>
      </div>);
  }
}

jest.mock('axios');

const testPath = new URL('https://localhost');
const testPath2 = new URL('https://localhost/home')

const mockEndpoints = {
    localhost: testPath.toString()
}

const MockContext = React.createContext(mockEndpoints);
class MockApp extends Component {
  render() {
    return (
      <MockContext.Provider value={mockEndpoints}>
        {this.props.children}
      </MockContext.Provider>
    );
  }
}

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

const CtxAjax = withContext(Ajax, MockContext, 'endpoints');

describe('Ajax smoke test', () => {
  it('renders without crashing', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    render(<Ajax receiver={TestDummy} url={testPath} defaultData='Loading...'
            callback={_.noop} />);
  });
});

describe('Ajax unittests', () => {
  it('performs axios get on componentDidMount', () => {
    axios.get
      .mockResolvedValueOnce({data: 'performs axios get on componentDidMount'})
      .mockResolvedValueOnce({data: 'performs axios get on componentDidMount'});
    render(<Ajax receiver={TestDummy} url={testPath}
            defaultData='Loading...' callback={_.noop} />);
    expect(axios.get.mock.calls.length).toBe(1);
    render(<Ajax receiver={TestDummy} url={testPath}
            defaultData='Loading...' callback={_.noop} showLoading />);
    expect(axios.get.mock.calls.length).toBe(2);
  });

  it('cancels a call when unmounted', () => {
    axios.get.mockResolvedValueOnce({data: 'cancels a call when unmounted'});
    let { unmount } = render(<Ajax receiver={TestDummy} url={testPath}
                              defaultData='Loading...' callback={_.noop} />);
    return wait(() => {
      unmount();
      expect(canceller.cancel.mock.calls.length).toBe(1);
    });
  });

  it('calls to a url passed in as a string', () => {
    axios.get.mockResolvedValueOnce({data: 'calls to a url passed in'});
    let { container } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' callback={_.noop} />);
    expect(axios.get.mock.calls[0][0]).toEqual(urlWithParams('https://localhost/', {}));
  });

  it('calls a url if the props update to a different value', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    let { rerender } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' hold />);
    expect(axios.get.mock.calls.length).toBe(0);
    rerender(<Ajax receiver={TestDummy} url={testPath2}
                                defaultData='Loading...' />);
    expect(axios.get.mock.calls.length).toBe(1);
  });

  it('passes the result of a call to its child', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    let { container } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' callback={_.noop} />);
    return wait(() => {
      expect(container.querySelector('#props-data').textContent).toBe('some data');
    });
  });

  it('passes all unknown props to receiver', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    const recevierProps = {1: '', 2: '', 3: '', 4: ''};
    let { container } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' callback={_.noop}
                                { ...recevierProps } />);
    return wait(() => {
      // add 2 to the expected length for the ajaxData, and isLoading
      expect(container.querySelector('#props-length').textContent).toBe('6');
    });
  });

  it('calls the supplied callback', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    const callback = jest.fn();
    let { container } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' callback={callback} />);
    return wait(() => {
      expect(callback.mock.calls.length).toBe(1);
    });
  })

  it('supplies the callback with data as param', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    const callback = jest.fn();
    let { container } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' callback={callback} />);
    return wait(() => {
      const { responseData, isLoading, isError, url } = callback.mock.calls[0][0];
      expect(responseData).toEqual('some data');
      expect(isLoading).toBe(false);
      expect(isError).toBe(false);
    });
  });

  it('holds a call if hold is true', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    let { container } = render(<Ajax receiver={TestDummy} url={testPath}
                                defaultData='Loading...' hold />);
    expect(axios.get.mock.calls.length).toBe(0);
  });

  it('calls axios get on mount with target and path instead of url', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    let { container } = render(
      <MockApp>
        <CtxAjax receiver={TestDummy} target='localhost' path=''
          defaultData='Loading...' />
      </MockApp>);
    expect(axios.get).toBeCalled();
  });

  it('calls to the correct endpoint with target and path', () => {
    axios.get.mockResolvedValueOnce({data: 'some data'});
    let { container } = render(
      <MockApp>
        <CtxAjax receiver={TestDummy} target='localhost' path='home'
          defaultData='Loading...' />
      </MockApp>);
    expect(axios.get.mock.calls[0][0].toString()).toEqual('https://localhost/home');
  });

  it('calls an endpoint if the path prop updates to a different value', () => {
    axios.get.mockResolvedValue({data: 'some data'});
    let { rerender } = render(
      <MockApp>
        <CtxAjax receiver={TestDummy} target='localhost' path='home'
          defaultData='Loading...' hold={true} />
      </MockApp>);
    expect(axios.get).not.toBeCalled();
    rerender(
      <MockApp>
        <CtxAjax receiver={TestDummy} target='localhost' path='other'
          defaultData='Loading...' hold={false} />
      </MockApp>);
    expect(axios.get).toBeCalled();
  });

  it('adds params to the url', () => {
    axios.get.mockResolvedValueOnce({data: 'calls to a url passed in'});
    let { container } = render(<Ajax receiver={TestDummy}
                                url={testPath} params={{one: 1, two: 2}}
                                defaultData='Loading...' callback={_.noop} />);
    expect(axios.get.mock.calls[0][0].toString()).toEqual('https://localhost/?one=1&two=2');
  });
});
