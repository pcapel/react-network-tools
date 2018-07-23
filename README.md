# react-network-tools
Declarative and composable data providers using socket.io and axios for react applications.
:hankey:  :fire:  :hankey:  :fire:

## Why
Because I wanted to use these in more than one project, and copy-pasta is a
great way to have out of sync stuffs.  This is the easy road for the time being.

## Install
I use yarn, so [the docs](https://yarnpkg.com/lang/en/docs/cli/add/) are clear:

`yarn add https://github.rackspace.com/phil9824/react-network-tools.git`

 Should get you up and running.  Unless you can't clone from my repo, or something
 that I don't know about.  In which case.... fork it I guess?

 ## Contents
 - [Socket](#socket)
   - [Socket.Emit](#socketemit)
   - [Socket.On](#socketon)
 - [Ajax](#ajax)
 - [ToDo](#todo)

## Use
The API consists of two Higher Order Components (HOCs), `<Socket />` and `<Ajax />`.
The implementation of `<Socket />` is agnostic of the framework used, so native
sockets, or socket.io, or anything that implements `on`, `emit`, and
`removeAllListeners` should work.  I designed it for socket.io client, so if it
can be fixed in a way that works better for you, just send a pull request.

The `<Ajax />` component was a little trickier.  I have built it out around the
axios library, since it provides a cross-platform way of cancelling requests.
This is a requirement for ending long running requests when the component
unmounts, since the callbacks all call `setState`.  Again, if there's a better
way, I'd be happy to accept a pull request.

Both components offer two ways of handling the initiation of network events.
There is the mechanism of calling when the component renders, and passing in a
component to receive the resulting data (or simply emit an event, for the socket).
As well as wrapping children and attaching an event handler to them.  I've found
that both cases have their uses, but the second is probably more likely.

Additionally, the convenience methods `withEndpointContext` and `withSocketContext`
are provided to wrap the component in the application context that provides the
value.  I wrap the components in their own module and export the wrapped component
to isolate the logic, but you do you.  The only argument required is the context
component.  So technically, you never _need_ to import `Ajax` or `Socket`.  
You basically redefine them in your application code base.  Your call.

---

# Socket
Socket contains two namespaced components, `Emit` and `On`.  These are exactly
what you think they are.


## Socket.Emit
The `Emit` wrapper is the most complex out of all of the components this package
provides, since it has some varied use cases.  The simplest, and most familiar,
is when it is used like any other AJAX request.  That is, you emit to the socket
and expect a return value.  This would normally be the callback function
provided, but I haven't really thought this through enough to implement that yet.

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
  ```javascript
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
Coming Soon...

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
- Add modular wrappers and smaller components, but ensure that they display the
  correct names for debugging
- Change `domEvent` prop to just be the event name for react as a boolean
- Add better handling of errors and edge cases
- Add PropTypes, which will make the next one easier
- Add docgen so I don't have to maintain this mess
- Verify the spec for WebSockets, and make sure the component matches
- How do you test code that is written with this library?
