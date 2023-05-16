import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import DataLoader from 'dataloader'
import { atom, useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import { SpotifyWebApi } from 'spotify-web-api-ts/types'

import { spotifyClientAtom } from '@/component/sdk/ClientAtoms'

const DataLoaderAtom = atom(get => get(spotifyClientAtom).then(createDataLoader))

const createDataLoader = (spotifyClient: SpotifyWebApi) =>
   new DataLoader<string, boolean>(
      async (trackIds: readonly string[]) => spotifyClient.library.areTracksSaved(trackIds as string[]),
      { maxBatchSize: 50, cache: false }
   )

export const usePrefetchLikes = (trackIds: string[]) => {
   const queryClient = useQueryClient()
   const createQuery = useCreateLikeQuery()
   const allIds = trackIds.join('-')

   useEffect(() => {
      const needToPrefetch = trackIds.filter(trackId => {
         const cacheEntry = queryClient.getQueryCache().find(useTrackLikeQueryKey(trackId))
         return cacheEntry === undefined
      })
      needToPrefetch.forEach(trackId => queryClient.prefetchQuery(createQuery(trackId)))
   }, [allIds, queryClient, createQuery])
}

const useTrackLikeQueryKey = (trackId: string) => ['AreTracksSaved', trackId]
const useCreateLikeQuery = () => {
   const dataLoader = useAtomValue(DataLoaderAtom)
   return useCallback(
      (trackId: string) => ({
         queryKey: useTrackLikeQueryKey(trackId),
         queryFn: () => dataLoader.load(trackId),
      }),
      [dataLoader]
   )
}

export const useTrackLikeQuery = (trackId: string, options?: UseQueryOptions<boolean, unknown, boolean, string[]>) => {
   const query = useCreateLikeQuery()(trackId)

   return useQuery({
      ...query,
      ...options,
   })
}

export const useUpdateTrackLike = (trackId: string) => {
   const queryClient = useQueryClient()
   const invalidate = () => queryClient.invalidateQueries(useTrackLikeQueryKey(trackId))
   return (like: boolean) => {
      invalidate()
      queryClient.setQueryData(useTrackLikeQueryKey(trackId), like)
   }
}
