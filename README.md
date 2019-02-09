[![Build Status](https://travis-ci.com/pcapel/react-network-tools.png?branch=master)](https://travis-ci.com/pcapel/react-network-tools)

# react-network-tools

Declarative and composable data providers using socket.io and axios for react
applications.

## Why
Because I wanted to use these in more than one project, and copy-pasta is a
great way to have out of sync stuffs.  Then I started to kind of like it, now I
figure that sharing it would be a cool thing to do.  So here's my first open
source project that might be worth anything.

## Install
### This is not yet deployed to NPM, while I want to get that done soon, I'm not sure when that will happen.
#### Probably soon though...
I use yarn, so [the docs](https://yarnpkg.com/lang/en/docs/cli/add/) are clear:

`yarn add https://github.com/pcapel/react-network-tools.git`

will work to install from this repository, but once I have published to npm

`yarn add react-network-tools`

should do the trick!

Should get you up and running.  Unless you can't clone from my repo, or something
that I don't know about.  In which case.... fork it I guess?

I'm currently trying to get Travis CI figured out.  If you notice anything off
about the repo, let me know!

 ## Contents
 - [Socket](#socket)
   - [Socket.Emit](#socketemit)
     - [Emit on render](#emit-on-render)
     - [Emit as button](#emit-as-button)
     - [Emit on event](#emit-on-event)
   - [Socket.On](#socketon)
 - [Ajax](#ajax)
 - [ToDo](#todo)

## Use
The API consists of two primary components, `<Socket />` and `<Ajax />`.
The implementation of `<Socket />` is agnostic of the framework used, so native
sockets, or socket.io, or anything that implements `on`, `emit`, and
`removeAllListeners` should work.  I designed it for socket.io client, so if it
can be fixed in a way that works better for you, just send a pull request.  The
`emit` method of the socket implementation should accept a function for the server
acknowledgement.

The `<Ajax />` component was a little trickier.  I have built it out around the
[axios](https://github.com/axios/axios) library, since it provides a cross-platform way of cancelling requests.
This is a requirement for ending long running requests when the component
unmounts, since the callbacks all call `setState`.  I had been using axios in the
project that spawned this, so it seemed like an easy choice.

Both components offer two ways of handling the initiation of network events.
There is the mechanism of calling when the component renders, and passing in a
component to receive the resulting data (or simply emit an event, for the socket).
As well as wrapping children and attaching an event handler to them.  I've found
that both cases have their uses, but the second is probably more likely.

Additionally, the convenience [HOC](https://reactjs.org/docs/higher-order-components.html)s `withEndpointContext` and `withSocketContext`
are provided to wrap the component in the application context that provides the
value.  I wrap the components in their own module and export the wrapped component
to isolate the logic, but you do you.  The only argument required is the context
component.  So technically, you never _need_ to import `Ajax` or `Socket`.  
You basically redefine them in your application code base.  Your call.

---

# Socket
Socket contains two name-spaced components, `Emit` and `On`.  These are exactly
what you think they are.  Because I designed it to not care about which
implementation you're using, the component takes in a `socket` prop.  I like to
create a socket instance in a module, then export it into the application root.
From there I pass it as into a `Provider`.  I really dig on [contexts](https://reactjs.org/docs/context.html).

You can create multiple sockets, and provide them however you like, but doing it
like this lets you use the helper function `withSocketContext`.  My method is
something like this:

``` jsx
// mysocket/index.js or wherever
import React from 'react'
import { withSocketContext } from 'react-network-tools'
// create a context

export const SocketContext = React.createContext()
export const MyScocket = withSocketContext(SocketContext)

// myapplication/index.js or wherever
import { MyScocket, SocketContext } from './mysocket'

// import or initialize socket as const socket

export const App = () => {
  <SocketContext.Provider value={socket}>
    <ApplicationRoot />
  </SocketContext.Provider>
}
```

And that's that!  All of my examples will assume that the socket is provided via
context like this.  If you don't want to use the context, then you will need to
pass it to the socket component explicitly, or provide it via state-to-props if
you keep in a `redux` store or similar.  Your call.

## Socket.Emit
The `Emit` wrapper is the most complex out of all of the components this package
provides, since it has some varied use cases.  The simplest, and most familiar,
is when it is used like any other asynchronous request.  That is, you emit to the
socket and expect a return value.  This would normally be the callback function
provided, which in this case can be passed with the `acknowledge` prop.

The next is a simple notification event.  Something on the client happened, and
we want to notify the server so that it can do something with the information.
Some examples might be, event broadcast to the room or all clients, analytic data
collection, erm... other stuff like that?  Anyway, it's not useless.

The more difficult part is the logic around _when_ to fire the event.  Sometimes
you don't want something to fire off immediately, but you don't want to have to
write complicated logic in your components to handle rendering the thing.  Or,
at least **I** don't want to have to.  So the API provides ways around that.


### Props

- `renders: <Component>` A valid react component to render as the child
  - (should it be something that renders when the event  fires?)
- `event: <String>` The event name to fire
- `domEvent: <String>` One of the valid React events, such as 'onClick'
- `payload: <Object>` The payload to deliver with the event
- `socket: <Object>` The websocket to use for the connection, should probably be provided with a context provider.
- `emissions: <Array>` An array of objects that follow the convention of
 ```javascript
 {event: String, payload: Object}
 ```
- `onUpdates: <Object>` Emissions to fire on componentDidUpdate
- `onMount: <Object>` Emissions to fire on componentDidMount
- `children: <React.Children>` La di da
- `<React DOM Event>: eg onClick` fires the emissions on the specified event.
  Alternatively, you can pass this as a prop with an object value that is one of:
  ``` javascript
  // most verbose
  {
    event: 'some-different-event',
    use: transformFunction // a function that takes the DOM event and returns the payload
  }
  // less verbose
  ['some-different-event', transformFunction]
  // to re-use the designated socket event
  transformFunction
  ```


### Common Patterns
#### Emit on render
Probably the simplest use case is to emit some event with the component renders.
It's pretty straight forward, you just tell it what you want!

``` jsx
import React, { Fragment } from 'react'

import { MySocket } from './where/you/put/it'

export const SomeComponent = (props) => {
  return (
    <Fragment>
      <MySocket.Emit event='hello-sockets' payload={props.somePayload} />
    </Fragment>
    )
}
```
Now anywhere that `SomeComponent` is rendered you will fire 'hello-sockets' on
the provided socket connection.  Pretty trivial example though.  What say we get
a little fancier?

``` jsx
import React, { Component } from 'react'

import { MySocket } from './where/you/put/it'

class FancyPants extends Component {
  constructor(props) {
    super(props)
    this.state = {
      responses: []
    }
  }

  handleResponse = (data) => {
    const responses = Object.assign([], this.state.responses)
    responses.push(data)
    this.setState({responses})
  }

  render() {
    const {
      someProp,
      propFunc
    } = this.props
    return (
      <div>
        <MySocket.Emit event={`${someProp}-special-event`}
          payload={someFunc} acknowledge={this.handleResponse} />
      {/* Some other stuff */}
      </div>
    )
  }
}
```

Ok, so let's break this down a bit.

Acknowledge callbacks:
A function passed to the `acknowledge` prop will be used to handle the data
response from the server's acknowledge callback.  That means that this is only
called if the server is setup to do so.

Dynamic Events:
Having your event names static is cool, but template literals are cooler.
The event must exist on the back-end for this to work, but it's a really nice
way to have things align.  Personally I wrote my backend to accept events from
a single event point, but the responses are based on the payload content.  More
on why in the `Socket.On` section.

Function as payload:
Sometimes you want to have a payload that is more dynamic as well.  Sometimes it
is _so_ dynamic, that the component doesn't even know what it is!  Passing a in
a function that returns the payload object makes it easier to separate the app's
logic around generating the payload from the declaration of the event.  I've
found this to be a nice thing.

#### Emit as button
One of the ways that I've really liked to use this is to emit on a button press.
Since I've packaged this with all the DOM events that React components can....
react to, you can just pass in the event as a boolean property.  Here's my
component for `SocketButton`:

``` jsx
import React, { Component } from 'react'
import _ from 'lodash'
import { Button } from 'pick-a-library-lol' // this is not a real library...

import { MySocket } from './where/you/put/it'

export class SocketButton extends Component {
  render() {
    const {
      event,
      payload,
      emissions,
      children,
      makePayload,
      acknowledge,
      ...passThrough
    } = this.props
    let sockProps, sendLoad
    if (_.isFunction(payload)) {
      sendLoad = payload()
    } else {
      sendLoad = payload
    }
    if (_.isUndefined(event)) {
      sockProps = {emissions: emissions}
    } else {
      sockProps = {payload: sendLoad, event, acknowledge}
    }
    return (
      <MySocket.Emit {...sockProps} onClick>
        <Button {...passThrough} onClick={(e) => e.preventDefault()}>
          {children}
        </Button>
      </MySocket.Emit>
    )
  }
}
```

There's a lot of wrapping up of props that has to happen, but it works.

#### Emit on event
So that button example is pretty neat, but like I said, I have all the events
that react will respond to in my utils.  That means that collecting usage metrics
_should_ be a breeze.  I haven't tried it out yet in an actual application, but
I've been trying to write solid tests around the concept.

``` jsx
import React from 'react'

import { MySocket } from './where/you/put/it'
import { MyOtherComponent } from './someplace'

export const EvilSpyComponent = (props) => {
  return <MySocket.Emit renders={MyOtherComponent} onMouseEnter {...props} />
}
```

Assuming that your props has the required key/values (event/payload, or emissions)
then you should see your server get hit on every `mouseenter` event.  Like I said
though, I haven't quite implemented this myself yet....

---

## Socket.On
The `On` component registers handlers for the specified event, and will
automatically remove them (an only those specified for the component), when it
unmounts.  That _should_ mean that you can have multiple different handlers
associated with the same event across components that are not necessarily mounted
at the same time, without colliding the removal of listeners.

### Props

- `renders: <Component>` A valid react component to render or update props on the specified event
- `socket: <Object>` The websocket to use for the connection, should probably be provided with a context provider.
- `event: <String>` The event name to listen for
- `call: <Function>` The callback function for the event
- `handles: <Array>` An array of objects matching the pattern
 ```javascript
 {event: String, use: Function}
 ```
  Where each `handles.event` will be registered with the `handles.use`


### Common Patterns
Coming Soon...

---

## Socket.RequestResponse
The `RequestResponse` object is probably going to seem out of place, but I bet
it grows on you.  It's a wrapper around logically related `emit` and `on` events
that allows you to treat a socket event more like a traditional HTTP Request/Response
cycle.
Why support this?  Because I'm going to use it is the simplest answer.  The
slightly longer answer includes, "Because I don't see how it's a terrible idea yet."


### Props


### Common Patterns
Coming Soon...

---

## Ajax
The `Ajax` component is a fairly straight forward interface around sending
asynchronous requests to a server and handling the returned data.  At this time,
the data is passed directly to a receiving component as an object containing 3
fields:
- `responseData: <Object>` The data from the response, using the `response.data`
 pattern the Promise callback from the request, default is defaultData prop
- `isLoading: <Boolean>` A flag indicating that the request has started, and is
 not yet resolved, default false
- `isError: <Boolean>` A flag indicating that the request resolved and was caught

Since the `responseData` is set to `defaulData` in the constructor, the most sane
default to pass in is that which the `receiver` will be expecting.  Since I can't
know the use case for everyone, I left it free to modify.

### Props
- `receiver: <Component>` The component that should receive the server response
- `url: <URL>` The URL to which the method with send
- `defaultData: <Any>` Required default for the ajaxData
- `callback: <Function>` A function which will be called with the ajaxData as its
            argument
- `hold: <Boolean>` Flag to hold the request until this value is `true`
- `endpoints: <Object>` An object mapping string keys to string base URLs for the
             desired application endpoints
- `target: <String>` A key supplied to build the URL from the endpoint object
          which allows easier support for contextual mappings
- `path: <String>` The path that will be applied to the target when building the
        URL from endpoint mappings
- `params: <Object>` Query string parameters to append to the full URL for the
 endpoint build process, example
 ```javascript
 {startDate: '7-11-18'}
 ```
 returns `https://baseurl/path?startDate=7-11-18`
 Supports as many key:value pairs as desired.
- `showLoading: <Boolean>` Flag to determine if a loader should wrap the component
- `loader: <Component>` Custom loading wrapper to use when `showLoading` is
 provided as `true`


### Common Patterns
Coming Soon...

---

# ToDo
- Does Ajax need to have a prop for data access, eg <Ajax access='data' /> would
  allow me to control how the response is accessed in the receive function.  This
  would help clear up the whole issue with forgetting to add that to tests...
- Are AJAX libraries isomorphic enough to allow dependency injection without
  headaches?
- Add modular wrappers and smaller components, but ensure that they display the
  correct names for debugging
- Add better handling of errors and edge cases
- Verify the spec for WebSockets, and make sure the component matches
- How do you test code that is written with this library?
