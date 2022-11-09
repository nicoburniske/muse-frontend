import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import App from './App'
import { Toaster } from 'react-hot-toast'
import { AppConfig } from 'util/AppConfig'
import React from 'react'
import { createClient, subscriptionExchange, Provider } from 'urql'
import { createClient as createWSClient } from 'graphql-ws'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'


// Such a hack to get session id.
const getSession = () => {
    return fetch(AppConfig.httpSessionEndpoint, { method: 'GET', credentials: 'include' })
        .then(r => r.text())
        .then(a => { return { Authorization: a } })
        .catch(e => console.error('Failed to get session', e))
}

const wsClient = createWSClient({
    url: AppConfig.websocketGraphEndpoint,
    connectionParams: getSession as () => Promise<{ Authorization: string }>
})

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
})

// Cache is persisted to local storage. 24 hours.
const queryClient = new QueryClient({ defaultOptions: { queries: { cacheTime: 24 * 60 * 60 * 1000 } } })

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider value={urqlClient}>
                <PersistQueryClientProvider
                    client={queryClient}
                    persistOptions={{ persister }}
                    contextSharing={true}
                >
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
                </PersistQueryClientProvider>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
)
