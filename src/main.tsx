import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import MuseRoutes from './MuseRoutes'
import toast, { Toaster } from 'react-hot-toast'
import { AppConfig } from 'util/AppConfig'
import { createClient, subscriptionExchange, Provider } from 'urql'
import { createClient as createWSClient } from 'graphql-ws'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MuseQueryClientProvider from 'MuseQueryClientProvider'
import { SpotifyPlaybackSdk } from 'component/sdk/PlaybackSDK'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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

// Set the height of the viewport to the height of the device.
// Needed to support mobile browsers.
window.addEventListener('resize', () => {
   // We execute the same script as before
   let vh = window.innerHeight * 0.01
   document.documentElement.style.setProperty('--vh', `${vh}px`)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
   <BrowserRouter>
      <DndProvider backend={HTML5Backend}>
         <Provider value={urqlClient}>
            <MuseQueryClientProvider useCache={true}>
               <>
                  <SpotifyPlaybackSdk
                     errorHandler={{
                        initializationError: e => toast.error(`SDK initialization error: ${e.message}`),
                        authenticationError: e => toast.error(`SDK authentication error: ${e.message}`),
                        accountError: e => toast.error(`SDK account error: ${e.message}`),
                        playbackError: e => toast.error(`Playback Error`, { duration: 1000 }),
                     }}
                  />
                  <ReactQueryDevtools initialIsOpen={false} />
                  {/* <DebugAtomsReduxDevTools /> */}
                  <MuseRoutes />
                  <Toaster
                     position='bottom-right'
                     reverseOrder={false}
                     gutter={8}
                     toastOptions={{
                        duration: 3000,
                        success: {
                           className: 'bg-success text-success-content',
                        },
                        error: {
                           className: 'bg-error text-error-content',
                        },
                     }}
                  />
               </>
            </MuseQueryClientProvider>
         </Provider>
      </DndProvider>
   </BrowserRouter>
)
