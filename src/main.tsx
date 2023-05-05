import './index.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createClient as createWSClient } from 'graphql-ws'
import MuseQueryClientProvider from 'MuseQueryClientProvider'
import { MuseToaster } from 'MuseToaster'
import { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ReactDOM from 'react-dom/client'
import toast from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import { createClient, Provider, subscriptionExchange } from 'urql'

import { SpotifyPlaybackSdk } from '@/component/sdk/PlaybackSDK'
import { useThemeValue } from '@/state/UserPreferences'
import { AppConfig } from '@/util/AppConfig'

import MuseRoutes from './MuseRoutes'

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
   const theme = useThemeValue()

   useEffect(() => {
      document.documentElement.setAttribute('data-theme', theme)
   }, [theme])

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
