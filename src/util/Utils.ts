import { ReviewDetailsFragment, ReviewEntityOverviewFragment } from 'graphql/generated/schema'

export type BoolNum = 0 | 1

export function msToTime(duration: number) {
    const
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        seconds = Math.floor((duration / 1000) % 60),
        ms = Math.floor((duration % 1000) / 100)

    return { hours, minutes, seconds, ms }
}

export function zip<A, B>(i: A[], j: B[]): [A, B][] {
    return i.map((a, index) => [a, j[index]])
}

/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
export function groupBy<K, V, R>(list: Array<V>, keyGetter: (input: V) => K, mapFunc: (value: V) => R): Map<K, Array<R>> {
    const map = new Map<K, Array<R>>()
    list.forEach((item) => {
        const key = keyGetter(item)
        const value = mapFunc(item)
        const collection = map.get(key)
        if (!collection) {
            map.set(key, [value])
        } else {
            collection.push(value)
        }
    })
    return map
}

export function uniqueByProperty<Item, UniqueProperty>(items: Item[], func: (t: Item) => UniqueProperty): Item[] {
    return [...new Map(items.map(item => [func(item), item])).values()]
}

export function nonNullable<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined
}

export function orElse<T extends {}>(value: T | undefined, defaultValue: T): NonNullable<T> {
    return nonNullable(value) ? value : defaultValue
}

export const getReviewOverviewImage = (review: ReviewDetailsFragment) => {
    const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
    const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
    return findFirstImage(allEntities)
}

export function findFirstImage(reviews: ReviewEntityOverviewFragment[]) {
    return reviews.map(entity =>
        (() => {
            switch (entity?.__typename) {
            case 'Artist':
                return entity?.artistImages?.at(0)
            case 'Playlist':
            case 'Album':
                return entity?.images?.at(0)
            case 'Track':
                return entity?.album?.images.at(0)
            }
        })()
    )
        .filter(nonNullable)
        .at(0)
}