import React from 'react'
import ReactDOM from 'react-dom'
import './styles/index.css'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom'

// 1
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

//import the key you need to retrieve the token from localStorage
import { AUTH_TOKEN } from './constants'

//import ApolloLink
import { ApolloLink } from 'apollo-client-preset'

//for subscriptions
import { split } from 'apollo-client-preset'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'


/*2
Here you create the HttpLink that will connect your ApolloClient instance with
the GraphQL API; your GraphQL server will be running on http://localhost:4000.
*/
const httpLink = new HttpLink({ uri: 'http://localhost:4000' })


/*
This middleware will be invoked every time ApolloClient sends a request to the
server. You can imagine the process of sending a request as a chain of
functions that are called. Each function gets passed the GraphQL operation and
another function called forward. forward needs to be called at the end of the
middleware function to pass the operation to the next middleware function in
the chain.
*/
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })
  return forward(operation)
})

const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)




/*
- https://www.howtographql.com/react-apollo/8-subscriptions/
- Now create a new WebSocketLink that represents the WebSocket connection.
Use split for proper “routing” of the requests and update the constructor call of ApolloClient like so:
- You’re instantiating a WebSocketLink that knows the subscriptions endpoint. The
subscriptions endpoint in this case is similar to the HTTP endpoint, except that
it uses the ws instead of http protocol. Notice that you’re also authenticating
the websocket connection with the user’s token that you retrieve from localStorage.
*/
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
})

/*
- Split is used to “route” (dirigir, rutear) a request to a specific middleware link
- It takes three arguments
*/
const link = split(

  /*First argument:
    - A test function which returns a boolean. If true the request will
    be forwarded to the link passed as the second argument. If false, to the third one
    - The test function is checking whether the requested operation is a
    subscription. If this is the case, it will be forwarded to the wsLink, otherwise
    (if it’s a query or mutation), the httpLinkWithAuthToken will take care of it
  */
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },

  //The remaining two arguments are again of type ApolloLink.
  wsLink,
  httpLinkWithAuthToken,
)








/*3
Now you instantiate ApolloClient by passing in the httpLink and a new instance
of an InMemoryCache

All the API requests are actually created and sent by the ApolloClient
instance ==> you need to make sure it knows about the user’s token ==> Apollo
provides a nice way for authenticating all requests by using the concept of
middleware, implemented as an Apollo Link
*/
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

/*4
Finally you render the root component of your React app. The App is wrapped
with the higher-order component ApolloProvider that gets passed the client as a
prop
*/
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root'),
)
registerServiceWorker()
