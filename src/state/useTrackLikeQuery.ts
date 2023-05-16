import { useQueryClient } from '@tanstack/react-query'
import DataLoader from 'dataloader'
import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { atomsWithQuery } from 'jotai-tanstack-query'
import { useCallback, useEffect, useMemo } from 'react'
import { SpotifyWebApi } from 'spotify-web-api-ts/types'

import { unsafeSpotifyClientAtom } from '@/component/sdk/ClientAtoms'

const DataLoaderAtom = atom(get => createDataLoader(get(unsafeSpotifyClientAtom)))

const createDataLoader = (spotifyClient: SpotifyWebApi) =>
   new DataLoader<string, boolean>(
      async (trackIds: readonly string[]) => spotifyClient.library.areTracksSaved(trackIds as string[]),
      { maxBatchSize: 50, cache: false }
   )

export const usePrefetchLikes = (trackIds: string[]) => {
   const queryClient = useQueryClient()
   const createQuery = useCreateLikeFetcher()
   const allIds = trackIds.join('-')

   useEffect(() => {
      const needToPrefetch = trackIds.filter(trackId => {
         const cacheEntry = queryClient.getQueryCache().find(useTrackLikeQueryKey(trackId))
         return cacheEntry === undefined
      })
      needToPrefetch.forEach(trackId => queryClient.prefetchQuery(createQuery(trackId)))
   }, [allIds, queryClient, createQuery])
}

const likeQueryAtoms = atomFamily((trackId: string) => makeLikeQueryAtom(trackId)[0])

const makeLikeQueryAtom = (trackId: string) =>
   atomsWithQuery(get => {
      const loader = get(DataLoaderAtom)
      return {
         queryKey: useTrackLikeQueryKey(trackId),
         queryFn: () => loader.load(trackId),
         staleTime: 30 * 1000,
      }
   })

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

export const useTrackLikeAtomQuery = (trackId: string) => {
   const likeAtom = useMemo(() => atom(get => get(likeQueryAtoms(trackId))), [trackId])
   const loaded = useAtomValue(loadable(likeAtom))
   if (loaded.state === 'hasError') {
      throw loaded.error
   } else if (loaded.state === 'loading') {
      return undefined
   } else {
      return loaded.data
   }
}

export const useUpdateTrackLike = (trackId: string) => {
   const queryClient = useQueryClient()
   const invalidate = () => queryClient.invalidateQueries(useTrackLikeQueryKey(trackId))
   return (like: boolean) => {
      invalidate()
      queryClient.setQueryData(useTrackLikeQueryKey(trackId), like)
   }
}
