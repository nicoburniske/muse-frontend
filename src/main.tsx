import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import PossibleTypesResultData from 'graphql/generated/fragmentTypes';
import App from './App'
import { Toaster } from 'react-hot-toast';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { AppConfig } from 'util/AppConfig';

// Such a hack to get session id.
const getSession = () => {
  return fetch(AppConfig.httpSessionEndpoint, { method: 'GET', credentials: 'include' })
    .then(r => r.text())
    .then(a => { return { Authorization: a } })
    .catch(e => console.error("Failed to get session", e))
}

const wsLink = new GraphQLWsLink(createClient({
  url: AppConfig.websocketGraphEndpoint,
  connectionParams: getSession as () => Promise<{ Authorization: string }>
}));

const queryClient = new QueryClient()

const httpLink = createHttpLink({
  uri: AppConfig.httpGraphEndpoint,
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
          <>
            <App />
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 3000,
                success: {
                  className: 'bg-success text-success-content',
                },
                error: {
                  className: 'bg-error text-error-content'
                },
              }}
            />
          </>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
