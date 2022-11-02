import { EntityType } from "graphql/generated/schema";
import { atom } from "jotai";
import atomWithDebounce from "state/atomWithDebounce";
import { BoolNum } from "util/Utils";


export const entityTypeAtom = atom<EntityType>(EntityType.Playlist)
export const parentReviewIdAtom = atom<string | undefined>(undefined)
export const isPublicAtom = atom<BoolNum>(0)
export const {
    isDebouncingAtom: isReviewNameDebouncing,
    debouncedValueAtom: debouncedReviewNameAtom,
    currentValueAtom: currentReviewNameAtom
} = atomWithDebounce("");
export const createReviewModalOpenAtom = atom(false)