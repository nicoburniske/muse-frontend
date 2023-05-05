import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import DataLoader from 'dataloader'
import { atom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { SpotifyWebApi } from 'spotify-web-api-ts/types'

import { spotifyClientAtom } from '@/component/sdk/ClientAtoms'

const MAX_PER_QUERY = 50

const DataLoaderAtom = atom(get => get(spotifyClientAtom).then(createDataLoader))

const createDataLoader = (spotifyClient: SpotifyWebApi) =>
   new DataLoader<string, boolean>(
      async (trackIds: readonly string[]) => spotifyClient.library.areTracksSaved(trackIds as string[]),
      { maxBatchSize: MAX_PER_QUERY, cache: false }
   )

export const usePrefetchLikes = (trackIds: string[]) => {
   const queryClient = useQueryClient()
   const createQuery = useCreateLikeFetcher()

   useEffect(() => {
      const needToPrefetch = trackIds.filter(trackId => {
         const cacheEntry = queryClient.getQueryCache().find(useTrackLikeQueryKey(trackId))
         return cacheEntry === undefined
      })
      needToPrefetch.forEach(trackId => queryClient.fetchQuery(createQuery(trackId)))
   }, [trackIds, queryClient, createQuery])
}

const useTrackLikeQueryKey = (trackId: string) => ['AreTracksSaved', trackId]
const useCreateLikeFetcher = () => {
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
   const queryClient = useQueryClient()
   const query = useCreateLikeFetcher()

   const queryKey = useMemo(() => useTrackLikeQueryKey(trackId), [trackId])

   const invalidate = useCallback(() => {
      queryClient.invalidateQueries(queryKey)
   }, [queryClient, queryKey])

   const updateLike = useCallback(
      (like: boolean) => {
         invalidate()
         queryClient.setQueryData(queryKey, like)
      },
      [invalidate, queryClient, queryKey]
   )

   return {
      query: useQuery({
         ...query(trackId),
         ...options,
      }),
      invalidate,
      updateLike,
   }
}
useTrackLikeQuery.getKey = useTrackLikeQueryKey
