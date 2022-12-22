/**
 * Memoized header for a review group.
 * Includes collapse group function.
 */

import { atom, useSetAtom } from 'jotai'
import { memo } from 'react'
import { selectedTrackAtom } from 'state/Atoms'
import { ReviewGroupHeader, ReviewGroupHeaderProps } from './GroupHeader'
import { expandedGroupsAtom } from './TableAtoms'

type MemoHeaderProps = Omit<ReviewGroupHeaderProps , 'onClick'>

const toggleExpandedGroupAtom = atom(null, (get, set, reviewId: string) => {
    // Clear selected track to avoid conflict with expanded group.
    set(selectedTrackAtom, undefined)
    const currentExpanded = get(expandedGroupsAtom)
    const exists = currentExpanded.includes(reviewId)
    if (exists) {
        const postRemove = currentExpanded.filter(group => group !== reviewId)
        set(expandedGroupsAtom, postRemove)
    } else {
        const postAdd = [...currentExpanded, reviewId]
        set(expandedGroupsAtom, postAdd)
    }
})

export const MemoHeader = memo((props: MemoHeaderProps) => {
    const isParent = props.parentReviewId === props.reviewId
    const toggleExpandedGroup = useSetAtom(toggleExpandedGroupAtom)
    const onClick = isParent ? () => { } : () => toggleExpandedGroup(props.reviewId)
    return (
        < ReviewGroupHeader
            {...props}
            onClick={onClick}
        />)
}, (prevProps, nextProps) =>
    prevProps.reviewId === nextProps.reviewId &&
    prevProps.parentReviewId === nextProps.parentReviewId
)
