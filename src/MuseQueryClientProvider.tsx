import {
   IsRestoringProvider,
   QueryClient,
   QueryClientProvider,
   QueryClientProviderProps,
   ShouldDehydrateQueryFunction,
} from '@tanstack/react-query'
import {
   PersistQueryClientOptions,
   persistQueryClientRestore,
   persistQueryClientSave,
} from '@tanstack/react-query-persist-client'
import useAccessTokenQuery from 'state/useAccessTokenQuery'
import { get, set, del } from 'idb-keyval'
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { Prettify } from 'util/Types'
import { useEffect, useRef, useState } from 'react'

const persister = createIDBPersister()

export default function MuseQueryClientProvider({
   useCache,
   children,
}: {
   useCache: boolean
   children: React.ReactNode
}) {
   const [queryClient] = useState(
      // Cache is persisted to local storage. 24 hours.
      new QueryClient({
         defaultOptions: {
            queries: {
               // One day.
               cacheTime: 24 * 60 * 60 * 1000,
               // 10 seconds.
               // TODO: Figure out if this is a bug. If staleTime is not set then individual query settings are ignored.
               staleTime: 10 * 1000,
               // default: true
               refetchOnWindowFocus: false,
            },
         },
      })
   )
   return useCache ? (
      <PersistQueryClientProvider
         client={queryClient}
         persistOptions={{ buster: 'MuseCache', persister, dehydrateOptions: { shouldDehydrateQuery } }}
      >
         {children}
      </PersistQueryClientProvider>
   ) : (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
   )
}

function arrayEquals(a: any, b: any) {
   return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index])
}

const shouldDehydrateQuery: ShouldDehydrateQueryFunction = query => {
   return query.state.status === 'success' && !arrayEquals(query.queryKey, useAccessTokenQuery.getKey())
}

export type PersistQueryClientProviderProps = Prettify<
   QueryClientProviderProps & {
      persistOptions: Omit<PersistQueryClientOptions, 'queryClient'>
      onSuccess?: () => void
   }
>

export const PersistQueryClientProvider = ({
   client,
   children,
   persistOptions,
   onSuccess,
   ...props
}: PersistQueryClientProviderProps): JSX.Element => {
   const [isRestoring, setIsRestoring] = useState(true)
   const refs = useRef({ persistOptions, onSuccess })

   useEffect(() => {
      refs.current = { persistOptions, onSuccess }
   }, [persistOptions, onSuccess])

   useEffect(() => {
      setIsRestoring(true)
      // Restore cache on mount.
      persistQueryClientRestore({
         ...refs.current.persistOptions,
         queryClient: client,
      }).then(() => {
         refs.current.onSuccess?.()
         setIsRestoring(false)
      })

      /**
       * Persist cache every minute and on tab close.
       */
      const persistCache = () => {
         persistQueryClientSave({ ...refs.current.persistOptions, queryClient: client })
      }

      const interval = setInterval(persistCache, 1000 * 60)
      window.addEventListener('beforeunload', persistCache)
      return () => {
         clearInterval(interval)
         window.removeEventListener('beforeunload', persistCache)
      }
   }, [client])

   return (
      <QueryClientProvider client={client} {...props}>
         <IsRestoringProvider value={isRestoring}>{children}</IsRestoringProvider>
      </QueryClientProvider>
   )
}

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
   return {
      persistClient: async (client: PersistedClient) => {
         set(idbValidKey, client)
      },
      restoreClient: async () => {
         return await get<PersistedClient>(idbValidKey)
      },
      removeClient: async () => {
         await del(idbValidKey)
      },
   } as Persister
}
