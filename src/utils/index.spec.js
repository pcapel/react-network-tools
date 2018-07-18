import React, {Component, Fragment} from 'react';
import {render} from 'react-testing-library';

import {WrapWithProps} from './index';

const Child = (props) => {
  return (
    <div data-testid='prop-holder'>
      {Object.keys(props).join(' ')}
    </div>
  );
}

const Holder = ({children}) => {
  return (
    <Fragment>
      {children}
    </Fragment>
  );
}

describe('WrapWithProps', () => {
  it('maps props onto a top-level child', () => {
    const {container} = render(
      <WrapWithProps inject={{prop1: '', prop2: ''}}>
        <Child />
      </WrapWithProps>
    );
    expect(container.firstChild.textContent).toBe('prop1 prop2');
  });

  it('maps props onto all top-level children', () => {
    const {container} = render(
      <WrapWithProps inject={{prop1: '', prop2: ''}}>
        <Child />
        <Child />
        <Child />
      </WrapWithProps>
    );
    container.querySelectorAll('[data-testid]').forEach(el => {
      expect(el.textContent).toBe('prop1 prop2')
    });
  });

  it('doesn\'t do weird things with chilren of children', () => {
    const {getByText} = render(
      <WrapWithProps inject={{prop1: '', prop2: ''}}>
        <Holder>
          <div id='test'>Hello</div>
        </Holder>
      </WrapWithProps>
    );
    expect(getByText('Hello').id).toBe('test');
  });
});
