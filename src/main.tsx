import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import PossibleTypesResultData from 'graphql/generated/fragmentTypes';
import App from './App'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient()

const link = createHttpLink({
  uri: 'http://localhost:8883/api/graphql',
  credentials: 'include'
})

const clientGraphQL = new ApolloClient({
  cache: new InMemoryCache({ possibleTypes: PossibleTypesResultData.possibleTypes }),
  link
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
              autoClose={5000}
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
