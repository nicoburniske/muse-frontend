import './index.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { retryExchange } from '@urql/exchange-retry'
import { createClient as createWSClient } from 'graphql-ws'
import MuseQueryClientProvider from 'MuseQueryClientProvider'
import { MuseToaster } from 'MuseToaster'
import { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createClient, Provider, subscriptionExchange } from 'urql'

import { AppConfig } from '@/util/AppConfig'

import MuseRoutes from './MuseRoutes'
import { DebugAtomsReduxDevTools } from './state/Atoms'
import { Theme, useThemeValue } from './state/UserPreferences'
import { nonNullable } from './util/Utils'

const wsClient = createWSClient({
   url: AppConfig.websocketGraphEndpoint,
})

const urqlClient = createClient({
   url: AppConfig.httpGraphEndpoint,
   exchanges: [
      // @ts-ignore
      retryExchange({
         initialDelayMs: 500,
         maxDelayMs: 500,
         randomDelay: false,
         maxNumberAttempts: 5,
         retryIf: err => {
            return nonNullable(err && err.networkError)
         },
      }),
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

const setDocumentTheme = (theme: Theme) => document.documentElement.setAttribute('data-theme', theme)

const Main = () => {
   const theme = useThemeValue()
   useEffect(() => {
      const css = document.createElement('style')
      css.appendChild(
         document.createTextNode(
            `* {
             -webkit-transition: none !important;
             -moz-transition: none !important;
             -o-transition: none !important;
             -ms-transition: none !important;
             transition: none !important;
          }`
         )
      )
      document.head.appendChild(css)
      setDocumentTheme(theme)
      const _ = window.getComputedStyle(css).opacity
      document.head.removeChild(css)
   }, [theme])

   return (
      <BrowserRouter>
         <DndProvider backend={HTML5Backend}>
            <Provider value={urqlClient}>
               <MuseQueryClientProvider useCache={true}>
                  <>
                     <ReactQueryDevtools initialIsOpen={false} />
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
