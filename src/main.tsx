import './index.css'

import { createClient as createWSClient } from 'graphql-ws'
import MuseQueryClientProvider from 'MuseQueryClientProvider'
import { MuseToaster } from 'MuseToaster'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createClient, Provider, subscriptionExchange } from 'urql'

import { AppConfig } from '@/util/AppConfig'

import MuseRoutes from './MuseRoutes'
import { Theme, useThemeValue } from './state/UserPreferences'

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
   const setDocumentTheme = (theme: Theme) => document.documentElement.setAttribute('data-theme', theme)
   setDocumentTheme(theme)

   return (
      <BrowserRouter>
         <DndProvider backend={HTML5Backend}>
            <Provider value={urqlClient}>
               <MuseQueryClientProvider useCache={true}>
                  <>
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
