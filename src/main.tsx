import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import PossibleTypesResultData from 'graphql/generated/fragmentTypes';
import App from './App'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:8883/ws/graphql',
  connectionParams: {
    Authorization: getCookie("XSESSION"),
  }
}));

function getCookie(name: string): string | null {
  const nameLenPlus = (name.length + 1);
  const cookie = document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(cookie => {
      return cookie.substring(0, nameLenPlus) === `${name}=`;
    })
    .map(cookie => {
      return decodeURIComponent(cookie.substring(nameLenPlus));
    })[0] || null;

  return cookie
}

const queryClient = new QueryClient()

const httpLink = createHttpLink({
  uri: 'http://localhost:8883/api/graphql',
  credentials: 'include'
})

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const clientGraphQL = new ApolloClient({
  cache: new InMemoryCache({ possibleTypes: PossibleTypesResultData.possibleTypes }),
  link: splitLink,
  connectToDevTools: true
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={clientGraphQL}>
        <BrowserRouter>
          <div>
            <App />
            <ToastContainer
              position="bottom-center"
              newestOnTop
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick={true}
              pauseOnHover={true}
              draggable={true}
            />
          </div>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
