import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';

import { Loadable } from '..';
import { urlWithParams } from '../utils';

export const withEndpointContext = (Component, Context) => {
  return props => {
    return (
      <Context.Consumer>
        {
          mapping => (<Component endpoints={mapping.endpoints} {...props} />)
        }
      </Context.Consumer>
    );
  }
}

const withLoader = (Component, Loader) => {
  return props => {
    const {isLoading, ...through} = props;
    return (
      <Loader isLoading={isLoading}>
        <Component {...through} />
      </Loader>
    );
  }
}

class AjaxWrapper extends Component {
  constructor(props) {
    super(props);
    this.callback = props.callback;
    this.state = {
      responseData: props.defaultData,
      isLoading: false,
      isHeld: props.hold,
      isError: false,
    }
  }

  componentDidMount() {
    const CancelToken = axios.CancelToken;
    this.source = CancelToken.source();
    let {isHeld} = this.state;
    if (!isHeld) {
      this.send(this.buildURL(this.props));
    }
  }

  componentDidUpdate(prevProps) {
    let {isHeld} = this.props;
    let nextURL = this.buildURL(this.props);
    if (!_.isEqual(this.buildURL(prevProps).toString(), nextURL.toString()) && !isHeld) {
      this.send(nextURL);
    }
  }

  receive = (updates) => {
    let state = Object.assign({}, this.state);
    let nextState = Object.assign(state, updates);
    this.setState(nextState);
    this.callback(nextState);
  }

  componentWillUnmount() {
    this.source.cancel();
  }

  render() {
    const {
      receiver,
      url,
      defaultData,
      callback,
      hold,
      target,
      path,
      endpoints,
      showLoading,
      params,
      ...passThroughProps
    } = this.props;
    const Receiver = receiver;
    const Render = showLoading ? withLoadable(Receiver) : Receiver;
    return (
      <Render ajaxData={ this.state }
        isLoading={this.state.isLoading}
        { ...passThroughProps } />
    );
  }

  send = (url) => {
    this.setState({isLoading: true});
    axios.get(url, {
      cancelToken: this.source.token
    }).then(response => response.data)
      .then(data => this.receive({responseData: data, isLoading: false}))
      .catch(data => this.receive({responseData: data, isLoading: false, isError: true}))
  }

  buildURL = (props) => {
    const {url, target, path, endpoints, params} = props;
    let urlStr;
    if (_.isUndefined(url)) {
      urlStr = `${endpoints[target]}${path}`;
    } else {
      urlStr = url;
    }
    return urlWithParams(urlStr, params);
  }
}

AjaxWrapper.defaultProps = {
  callback: () => {},
  hold: false,
  showLoading: false,
  params: {}
}

export const Ajax = withEndpointContext(AjaxWrapper);
