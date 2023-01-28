
/**
 * Atoms for GroupedTrackTable
 */

import { DetailedTrackFragment } from 'graphql/generated/schema'
import { atom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import derivedAtomWithWrite from 'state/derivedAtomWithWrite'
import { nonNullable, uniqueByProperty } from 'util/Utils'
import { getTrack, getTrackId, getTracks, Group, HeaderData, ReviewOverview, TrackRow } from './Helpers'
import { MemoHeader } from './MemoHeader'
import { MemoTrack } from './MemoTrack'

/**
 * Constructor atoms!
 */

export type CreateTable = {
    results: Group[]
    rootReviewId: string
}

export const setResultsAtom = atom(null, (get, set, { results, rootReviewId }: CreateTable) => {
    set(resultsAtom, results)
    set(reviewOrderAtom, results.map(r => r.overview.reviewId))

    const currentReviewId = get(rootReviewIdAtom)
    set(rootReviewIdAtom, rootReviewId)

    // We need one to be open always.
    // TOOD: This will probably not work without cache.
    if (rootReviewId !== currentReviewId && results.length > 0) {
        set(expandedGroupsAtom, [results[0].overview.reviewId])
    }
})


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

export type GroupWithTracks = { tracks: TrackRow[], headerData: HeaderData, overview: ReviewOverview }
export const groupWithTracksAtom = atom<GroupWithTracks[]>(get =>
    get(sortedGroupsAtom)
        .map(result => ({ tracks: getTracks(result.data), headerData: result.data as HeaderData, overview: result.overview }))
)
groupWithTracksAtom.debugLabel = 'allGroupsAtom'

export const tracksAtom = atom<DetailedTrackFragment[]>(get =>
    get(groupWithTracksAtom)
        .flatMap(g => g.tracks)
        .map(t => getTrack(t))
        .filter(nonNullable))
tracksAtom.debugLabel = 'tracksAtom'

const uniqueTracksAtom = derivedAtomWithWrite(atom<DetailedTrackFragment[]>(get => uniqueByProperty(get(tracksAtom), t => t.id)))
uniqueTracksAtom.debugLabel = 'uniqueTracksAtom'
const getTrackLikeAtom = (trackId: string) => {
    const focused = focusAtom(uniqueTracksAtom, (optic) =>
        optic
            .find(t => t.id === trackId)
            .prop('isLiked')
            .valueOr(false))
    return atom((get) => get(focused) ?? false, (_get, set, value) => set(focused, value))
}

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

export const renderedGroupsAtom = atom<GroupRendered[]>(get => {
    const rootReviewId = get(rootReviewIdAtom)
    const allGroups = get(groupWithTracksAtom)

    return allGroups.map(({ tracks, headerData, overview }) => {
        const isPlaylist = headerData.__typename === 'Playlist'
        const header = {
            element:
                // TODO: Change Headers for ALBUMS!!!!
                <MemoHeader
                    {...overview}
                    entity={headerData}
                    parentReviewId={rootReviewId}
                />,
            size: isPlaylist ? 42 : 58
        }
        const { reviewId } = overview
        const children = tracks.map((t, i) => {
            const likeAtom = getTrackLikeAtom(getTrackId(t))
            return {
                element: (
                    <MemoTrack
                        track={t}
                        index={i}
                        reviewId={overview.reviewId}
                        isLikedAtom={likeAtom} />),
                size: 60
            }
        })
        return { reviewId, header, children }
    })
})
renderedGroupsAtom.debugLabel = 'renderedGroupsAtom'

export const indexToJsxAtom = atom<React.ReactNode[]>(get => {
    const expandedGroups = get(expandedGroupsAtom)
    return get(renderedGroupsAtom).flatMap(({ reviewId, header, children }) => {
        if (expandedGroups.includes(reviewId)) {
            return [header.element, ...children.map(c => c.element)]
        } else {
            return [header.element]
        }
    })
})

// Used for Table virtualizer size estimation.
// Headers have different sizes than tracks.
export const indexToSizeAtom = atom<number[]>(get => {
    const expandedGroups = get(expandedGroupsAtom)
    const result = get(renderedGroupsAtom).flatMap(({ reviewId, header, children }) => {
        if (expandedGroups.includes(reviewId)) {
            return [header.size, ...children.map((c) => c.size)]
        } else {
            return [header.size]
        }
    })
    return result
})

// Used for sticky headers.
// It's not my fault for loops are fast in javascript.
export const headerIndicesAtom = atom<number[]>(get => {
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
 * 
 * TODO: Playlist track drag and drop.
 */


export const swapReviewsAtom = atom(null, (get, set, { dragReviewId, dropReviewId }: { dragReviewId: string, dropReviewId: string }) => {
    const currentOrder = get(reviewOrderAtom)
    const currentDragIndex = currentOrder.indexOf(dragReviewId)
    const currentDropIndex = currentOrder.indexOf(dropReviewId)

    if (currentDropIndex !== -1 && currentDragIndex !== -1) {
        const newOrder = currentOrder.filter(r => r !== dragReviewId)
        newOrder.splice(currentDropIndex, 0, dragReviewId)
        set(reviewOrderAtom, newOrder)
    }
})