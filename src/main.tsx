import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import MuseRoutes from './MuseRoutes'
import { Toaster } from 'react-hot-toast'
import { AppConfig } from 'util/AppConfig'
import { createClient, subscriptionExchange, Provider } from 'urql'
import { createClient as createWSClient } from 'graphql-ws'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MuseQueryClientProvider from 'MuseQueryClientProvider'
import { SpotifyPlaybackSdk } from 'component/sdk/PlaybackSDK'
import { DebugAtomsReduxDevTools } from 'state/Atoms'

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



ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
            <Provider value={urqlClient}>
                <MuseQueryClientProvider
                    useCache={false}
                >
                    <>
                        <SpotifyPlaybackSdk />
                        {/* <DebugAtomsReduxDevTools /> */}
                        <MuseRoutes />
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
                </MuseQueryClientProvider>
            </Provider>
        </DndProvider>
    </BrowserRouter>
)
