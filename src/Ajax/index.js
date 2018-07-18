import React from 'react';
import { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';

import { hasUndefined, WrapWithProps, urlWithParams } from '..';

export const withLoader = (Component, Loader) => {
  return props => {
    const {ajaxData, ...through} = props;
    const {isLoading} = ajaxData;
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
    let {hold} = this.props;
    if (!hold) {
      this.send(this.buildURL(this.props));
    }
  }

  componentDidUpdate(prevProps) {
    let {hold} = this.props;
    let nextURL = this.buildURL(this.props);
    if (!_.isEqual(this.buildURL(prevProps).toString(), nextURL.toString()) && !hold) {
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
      children,
      url,
      defaultData,
      callback,
      hold,
      target,
      path,
      endpoints,
      showLoading,
      params,
      loader,
      ...passThroughProps
    } = this.props;
    const Receiver = receiver;
    const Render = React.isValidElement(loader) ? withLoader(Receiver, loader) : Receiver;
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

AjaxWrapper.displayName = 'Ajax';

export const Ajax = AjaxWrapper;
