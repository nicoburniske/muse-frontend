import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { Toaster } from 'react-hot-toast'
import { AppConfig } from 'util/AppConfig'
import { createClient, subscriptionExchange, Provider } from 'urql'
import { createClient as createWSClient } from 'graphql-ws'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { DebugAtoms } from 'state/Atoms'
import React from 'react'

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


const QueryClientProviderOptions = ({ useCache, children }: { useCache: boolean, children: React.ReactNode }) => {
    // Cache is persisted to local storage. 24 hours.
    const queryClient = new QueryClient({ defaultOptions: { queries: { cacheTime: 24 * 60 * 60 * 1000 } } })

    const persister = createSyncStoragePersister({
        storage: window.localStorage,
    })

    return useCache ?
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
        >
            {children}
        </PersistQueryClientProvider>
        :
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Provider value={urqlClient}>
            <QueryClientProviderOptions
                useCache={true}
            >
                <>
                    <DebugAtoms />
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
            </QueryClientProviderOptions>
        </Provider>
    </BrowserRouter>
)
