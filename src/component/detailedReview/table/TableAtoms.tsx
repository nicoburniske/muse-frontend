
/**
 * Atoms for GroupedTrackTable
 */

import { DetailedTrackFragment } from 'graphql/generated/schema'
import { atom } from 'jotai'
import derivedAtomWithWrite from 'state/derivedAtomWithWrite'
import { nonNullable, uniqueByProperty } from 'util/Utils'
import { getTrack, getTracks, Group, HeaderData, ReviewOverview, TrackRow } from './Helpers'
import { MemoHeader } from './MemoHeader'
import { MemoTrack } from './MemoTrack'

/**
 * Constructor atoms!
 */
export const rootReviewIdAtom = atom<string>('')
rootReviewIdAtom.debugLabel = 'rootReviewIdAtom'

export const resultsAtom = atom<Group[]>([])
resultsAtom.debugLabel = 'resultsAtom'

// Contains the reviewId of the expanded groups.
export const expandedGroupsAtom = atom<string[]>([])
expandedGroupsAtom.debugLabel = 'expandedGroupsAtom'

/**
 * Derived atoms!
 */

export type DetailsAndTracks = { tracks: TrackRow[], headerData: HeaderData, overview: ReviewOverview }
export const allGroupsAtom = atom<DetailsAndTracks[]>(get => get(resultsAtom)
    // TODO: do we need to validate? 
    .map(result => ({ tracks: getTracks(result.data), headerData: result.data as HeaderData, overview: result.overview }))
    .filter(group => nonNullable(group.tracks))
)
allGroupsAtom.debugLabel = 'allGroupsAtom'

export const tracksAtom = atom<DetailedTrackFragment[]>(get =>
    get(allGroupsAtom)
        .flatMap(g => g.tracks)
        .map(t => getTrack(t))
        .filter(nonNullable))
tracksAtom.debugLabel = 'tracksAtom'

const derivedUniqueTracksAtom = atom<DetailedTrackFragment[]>(get => uniqueByProperty(get(tracksAtom), t => t.id))
export const uniqueTracksAtom = derivedAtomWithWrite(derivedUniqueTracksAtom)
uniqueTracksAtom.debugLabel = 'uniqueTracksAtom'

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

    return get(allGroupsAtom).map(({ tracks, headerData, overview }) => {
        const header = {
            element:
                // TODO: Change Headers for ALBUMS!!!!
                <MemoHeader
                    {...overview}
                    entity={headerData}
                    parentReviewId={rootReviewId}
                />,
            size: 40
        }
        const { reviewId } = overview
        const children = tracks.map(t => ({
            element: (
                <MemoTrack
                    track={t}
                    reviewId={overview.reviewId}
                    tracksAtom={uniqueTracksAtom} />),
            size: 60
        }))
        return { reviewId, header, children }
    })
})

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
    const groups = get(allGroupsAtom)

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
