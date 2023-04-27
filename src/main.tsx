import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import MuseRoutes from './MuseRoutes'
import toast from 'react-hot-toast'
import { AppConfig } from 'util/AppConfig'
import { createClient, subscriptionExchange, Provider } from 'urql'
import { createClient as createWSClient } from 'graphql-ws'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MuseQueryClientProvider from 'MuseQueryClientProvider'
import { SpotifyPlaybackSdk } from 'component/sdk/PlaybackSDK'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { MuseToaster } from 'MuseToaster'
import './index.css'

const wsClient = createWSClient({
   url: AppConfig.websocketGraphEndpoint,
})

const urqlClient = createClient({
   url: AppConfig.httpGraphEndpoint,
   exchanges: [
      // ...defaultExchanges,
      subscriptionExchange({
         forwardSubscription: operation => ({
            subscribe: sink => ({
               unsubscribe: wsClient.subscribe(operation, sink),
            }),
         }),
      }),
   ],
})

const Main = () => {
   return (
      <BrowserRouter>
         <DndProvider backend={HTML5Backend}>
            <Provider value={urqlClient}>
               <MuseQueryClientProvider useCache={true}>
                  <>
                     <SpotifyPlaybackSdk
                        errorHandler={{
                           initializationError: e =>
                              toast.error(`SDK initialization error: ${e.message}`, {
                                 duration: 1000,
                                 id: 'sdk-init-error',
                              }),
                           authenticationError: e =>
                              toast.error(`SDK authentication error: ${e.message}`, {
                                 duration: 1000,
                                 id: 'sdk-auth-error',
                              }),
                           accountError: e =>
                              toast.error(`SDK account error: ${e.message}`, {
                                 duration: 1000,
                                 id: 'sdk-account-error',
                              }),
                           playbackError: e =>
                              toast.error(`Playback Error`, { duration: 1000, id: 'sdk-playback-error' }),
                        }}
                     />
                     {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                     {/* <DebugAtomsReduxDevTools /> */}
                     <MuseRoutes />
                     <MuseToaster />
                  </>
               </MuseQueryClientProvider>
            </Provider>
         </DndProvider>
      </BrowserRouter>
   )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main />)
