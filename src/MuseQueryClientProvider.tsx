import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider, ShouldDehydrateQueryFunction } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import useAccessTokenQuery from 'state/useAccessTokenQuery'



export default function MuseQueryClientProvider({ useCache, children }: { useCache: boolean, children: React.ReactNode }) {
    // Cache is persisted to local storage. 24 hours.
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                // One day.
                cacheTime: 24 * 60 * 60 * 1000,
                // 10 seconds.
                // TODO: Figure out if this is a bug. If staleTime is not set then individual query settings are ignored.
                staleTime: 10 * 60 * 1000,
                // default: true
                refetchOnWindowFocus: false,
            },
        }
    })

    const persister = createSyncStoragePersister({
        storage: window.localStorage,
    })

    return useCache ?
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister, dehydrateOptions: { shouldDehydrateQuery } }}
        >
            {children}
        </PersistQueryClientProvider>
        :
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider >
}

function arrayEquals(a: any, b: any) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
}

const shouldDehydrateQuery: ShouldDehydrateQueryFunction = (query) => {
    const queryIsReadyForPersistance = query.state.status === 'success'
    if (queryIsReadyForPersistance) {
        const { queryKey } = query
        const excludeFromPersisting = arrayEquals(queryKey, useAccessTokenQuery.getKey())
        return !excludeFromPersisting
    }
    return queryIsReadyForPersistance
}