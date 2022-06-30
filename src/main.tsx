import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import App from './App'

const queryClient = new QueryClient()

const link = createHttpLink({
  uri: 'http://localhost:8883/api/graphql',
  credentials: 'include'
})

const clientGraphQL = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={clientGraphQL}>
        <App />
      </ApolloProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
