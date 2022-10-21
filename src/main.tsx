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
import { AppConfig } from 'util/Config';

// Such a hack to get session id.
const getSession = () => {
  const cookie = getCookie("XSESSION")
  if (cookie) {
    return Promise.resolve({ Authorization: cookie })
  }
  return fetch(`https://${AppConfig.backendUrl}/session`, { method: 'GET', credentials: 'include' })
    .then(r => r.text())
    .then(a => { return { Authorization: a } })
    .catch(e => console.error("Failed to get session", e))
}

const wsLink = new GraphQLWsLink(createClient({
  url: `wss://${AppConfig.backendUrl}/ws/graphql`,
  connectionParams: getSession as () => Promise<{ Authorization: string }>
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
  uri: `https://${AppConfig.backendUrl}/api/graphql`,
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
            <ToastContainer
              position="bottom-center"
              newestOnTop
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick={true}
              pauseOnHover={true}
              draggable={true}
              limit={2}
            />
          </>
        </BrowserRouter>
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
