import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { Toaster } from 'react-hot-toast';
import { AppConfig } from 'util/AppConfig';
import React from 'react';
import { createClient, subscriptionExchange, Provider } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';

// Such a hack to get session id.
const getSession = () => {
  return fetch(AppConfig.httpSessionEndpoint, { method: 'GET', credentials: 'include' })
    .then(r => r.text())
    .then(a => { return { Authorization: a } })
    .catch(e => console.error("Failed to get session", e))
}

const wsClient = createWSClient({
  url: AppConfig.websocketGraphEndpoint,
  connectionParams: getSession as () => Promise<{ Authorization: string }>
});

const urqlClient = createClient({
  url: '/graphql',
  exchanges: [
    // ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription: (operation) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe(operation, sink),
        }),
      }),
    }),
  ],
});

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider value={urqlClient}>
        <QueryClientProvider client={queryClient} contextSharing={true}>
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
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
)
