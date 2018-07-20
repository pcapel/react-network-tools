import React, {Component, Fragment} from 'react';
import {render} from 'react-testing-library';

import {WrapWithProps, pickEvents, createHandler} from './index';

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

describe('pickEvents', () => {
  it('picks out keys object {k | k in reactEvents} as array of strings', () => {
    const hasKeys = {
      onClick: true,
      onMouseDown: true
    }
    expect(pickEvents(hasKeys)).toEqual(['onClick', 'onMouseDown']);
  });

  it('does not pick unknown keys', () => {
    const hasKeys = {
      onClick: true,
      onMouseDow: true,
      smoobly: true
    }
    expect(pickEvents(hasKeys)).toEqual(['onClick']);
  });
});

describe('createHandler', () => {
  it('creates an object handler for a valid reactEvent', () => {
    const spy = jest.fn();
    const testCalls = [
      {func: spy, args: []}
    ];
    const result = createHandler('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick();
    expect(spy).toHaveBeenCalled();
  });

  it('calls the calls[i].func with calls[i].args', () => {
    const spy = jest.fn();
    const testCalls = [
      {func: spy, args: ['hello', 'world']}
    ];
    const result = createHandler('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick();
    expect(spy).toHaveBeenCalledWith('hello', 'world');
  });

  it('allows calls[i].args to be undefined', () => {
    const spy = jest.fn();
    const testCalls = [
      {func: spy}
    ];
    const result = createHandler('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick();
    expect(spy).toHaveBeenCalled();
  });

  it('subs event object for first arg if calls[i].event = true, no args', () => {
    const spy = jest.fn();
    const testCalls = [
      {func: spy, event: true}
    ];
    const mockEvent = {hello: 'world'};
    const result = createHandler('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent);
  });

  it('subs event object for first arg if calls[i].event = true, multiple args', () => {
    const spy = jest.fn();
    const testCalls = [
      {func: spy, event: true, args: ['hello', 'world']}
    ];
    const mockEvent = {hello: 'world'};
    const result = createHandler('onClick', testCalls);
    expect(spy).not.toHaveBeenCalled();
    result.onClick(mockEvent);
    expect(spy).toHaveBeenCalledWith(mockEvent, 'hello', 'world');
  });

  it('logs an error for invalid react events', () => {
    console.error = jest.fn();
    const expectMessage = 'Unable to create valid handler using invalidEvent';
    createHandler('invalidEvent');
    expect(console.error).toBeCalledWith(expectMessage);
  });

  it('returns an empty object for eventName === undefined', () => {
    expect(createHandler(undefined)).toEqual({});
  });
});
