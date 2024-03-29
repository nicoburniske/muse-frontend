/**
 * Atoms for GroupedTrackTable
 */

import { atom } from 'jotai'

import { EitherTrackMemo } from '@/component/track/EitherTrack'
import { DetailedTrackFragment } from '@/graphql/generated/schema'
import { searchLoweredAtom } from '@/state/Atoms'
import { nonNullable } from '@/util/Utils'

import { getTrack, getTracks, Group, HeaderData, ReviewOverview, searchTrack, TrackRow } from './Helpers'
import { MemoHeader } from './MemoHeader'

/**
 * Constructor atoms!
 */

export type CreateTable = {
   results: Group[]
   rootReviewId: string
}

export const setResultsAtom = atom(null, (get, set, results: Group[]) => {
   set(resultsAtom, results)
   set(
      reviewOrderAtom,
      results.map(r => r.overview.reviewId)
   )
   const rootReviewId = get(rootReviewIdAtom)

   if (results.length === 1 && results[0].overview.reviewId === rootReviewId) {
      set(expandedGroupsAtom, [results[0].overview.reviewId])
      set(showHeadersAtom, false)
   } else {
      set(showHeadersAtom, true)
   }
})

export const showHeadersAtom = atom(true)
showHeadersAtom.debugLabel = 'showHeadersAtom'

export const rootReviewIdAtom = atom<string>('')
rootReviewIdAtom.debugLabel = 'rootReviewIdAtom'

export const resultsAtom = atom<Group[]>([])
resultsAtom.debugLabel = 'resultsAtom'

// Contains the ReviewIDs of the expanded groups.
export const expandedGroupsAtom = atom<string[]>([])
expandedGroupsAtom.debugLabel = 'expandedGroupsAtom'

// ReviewIDs in order.
export const reviewOrderAtom = atom<string[]>([])
reviewOrderAtom.debugLabel = 'reviewOrderAtom'

/**
 * Derived atoms!
 */

const sortedGroupsAtom = atom(get => {
   const results = get(resultsAtom)
   const reviewOrder = get(reviewOrderAtom)
   return [...results].sort((a, b) => {
      const aIndex = reviewOrder.indexOf(a.overview.reviewId)
      const bIndex = reviewOrder.indexOf(b.overview.reviewId)
      return aIndex - bIndex
   })
})
sortedGroupsAtom.debugLabel = 'sortedGroupsAtom'

export type GroupWithTracks = { tracks: TrackRow[]; headerData: HeaderData; overview: ReviewOverview }
export const groupWithTracksAtom = atom<GroupWithTracks[]>(get => {
   const search = get(searchLoweredAtom)
   return get(sortedGroupsAtom).map(result => ({
      tracks: getTracks(result.data).filter(t => searchTrack(t, search)),
      headerData: result.data as HeaderData,
      overview: result.overview,
   }))
})
groupWithTracksAtom.debugLabel = 'allGroupsAtom'

export const tracksAtom = atom<DetailedTrackFragment[]>(get =>
   get(groupWithTracksAtom)
      .flatMap(g => g.tracks)
      .map(t => getTrack(t))
      .filter(nonNullable)
)
tracksAtom.debugLabel = 'tracksAtom'

// Render all rows and store in Atom.
export type GroupRendered = {
   reviewId: string
   header: SizedElement
   children: SizedElement[]
}
export type SizedElement = {
   element: React.ReactNode
   size: number
}

const renderedGroupsAtom = atom<GroupRendered[]>(get => {
   const rootReviewId = get(rootReviewIdAtom)
   const allGroups = get(groupWithTracksAtom)

   return allGroups.map(({ tracks, headerData, overview }) => {
      const header = {
         element: <MemoHeader {...overview} entity={headerData} parentReviewId={rootReviewId} />,
         size: 60,
      }
      const { reviewId } = overview
      const children = tracks.map((t, i) => {
         return {
            element: <EitherTrackMemo track={t} index={i} reviewId={overview.reviewId} />,
            size: 60,
         }
      })
      return { reviewId, header, children }
   })
})
renderedGroupsAtom.debugLabel = 'renderedGroupsAtom'

function mapGroups<T>(func: (elem: SizedElement) => T) {
   return atom<T[]>(get => {
      const expandedGroups = get(expandedGroupsAtom)
      const showHeader = get(showHeadersAtom)
      return get(renderedGroupsAtom).flatMap(({ reviewId, header, children }) => {
         if (expandedGroups.includes(reviewId)) {
            const childElements = children.map(func)
            if (showHeader) {
               return [func(header), ...childElements]
            } else {
               return childElements
            }
         } else {
            return showHeader ? [func(header)] : []
         }
      })
   })
}

export const indexToJsxAtom = mapGroups(get => get.element)

// Used for Table virtualizer size estimation.
// Headers have different sizes than tracks.
export const indexToSizeAtom = mapGroups(get => get.size)

// Used for sticky headers.
// It's not my fault for loops are fast in javascript.
export const headerIndicesAtom = atom<number[]>(get => {
   if (!get(showHeadersAtom)) return new Array<number>()

   const expandedGroups = get(expandedGroupsAtom)
   const indices = new Array<number>()
   const groups = get(groupWithTracksAtom)

   let sum = 0
   for (let i = 0; i < groups.length; i++) {
      // Account for header.
      indices.push(sum)
      sum += 1
      // Skip Tracks.
      if (expandedGroups.includes(groups[i].overview.reviewId)) {
         sum += groups[i].tracks.length
      }
   }
   // Want reverse order because this is used for sticky headers.
   return indices.reverse()
})
headerIndicesAtom.debugLabel = 'headerIndicesAtom'

/**
 * Drag and drop atoms.
 */
export const swapReviewsAtom = atom(
   null,
   (get, set, { dragReviewId, dropReviewId }: { dragReviewId: string; dropReviewId: string }) => {
      const currentOrder = get(reviewOrderAtom)
      const currentDragIndex = currentOrder.indexOf(dragReviewId)
      const currentDropIndex = currentOrder.indexOf(dropReviewId)

      if (currentDropIndex !== -1 && currentDragIndex !== -1) {
         const newOrder = currentOrder.filter(r => r !== dragReviewId)
         newOrder.splice(currentDropIndex, 0, dragReviewId)
         set(reviewOrderAtom, newOrder)
      }
   }
)
