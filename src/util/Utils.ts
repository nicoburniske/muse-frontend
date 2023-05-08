import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import {
   EntityType,
   ReviewDetailsFragment,
   ReviewEntityOverviewFragment,
   UserWithSpotifyOverviewFragment,
} from '@/graphql/generated/schema'

export const EntityTypeValues: readonly EntityType[] = ['Track', 'Album', 'Artist', 'Playlist'] as const

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

export function msToTime(duration: number) {
   const hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      seconds = Math.floor((duration / 1000) % 60),
      ms = Math.floor((duration % 1000) / 100)

   return { hours, minutes, seconds, ms }
}

export function msToTimeStr(duration: number) {
   const { hours, minutes, seconds, ms } = msToTime(duration)

   return {
      hours: padTime(hours),
      minutes: padTime(minutes),
      seconds: padTime(seconds),
      ms: padTime(ms),
   }
}

export const padTime = (num: number) => String(num).padStart(2, '0')

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
export function groupBy<K, V, R>(
   list: Array<V>,
   keyGetter: (input: V) => K,
   mapFunc: (value: V) => R = (value: V) => value as unknown as R
): Map<K, Array<R>> {
   const map = new Map<K, Array<R>>()
   list.forEach(item => {
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

export const getReviewOverviewImage = (review: ReviewDetailsFragment, index = 0) => {
   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
   return findFirstImage(allEntities, index)
}

export const userDisplayNameOrId = (user: UserWithSpotifyOverviewFragment) => {
   return user?.spotifyProfile?.displayName ?? user?.id
}

export function findFirstImage(reviews: ReviewEntityOverviewFragment[], index?: number) {
   const atIndex = index === undefined ? 0 : index
   return (
      reviews
         .flatMap(entity =>
            (() => {
               /* eslint-disable */
               switch (entity?.__typename) {
                  case 'Artist':
                     return entity?.artistImages ?? []
                  case 'Playlist':
                  case 'Album':
                     return entity?.images ?? []
                  case 'Track':
                     return entity?.album?.images ?? []
               }
               /* eslint-enable*/
            })()
         )
         .filter(nonNullable)
         .filter((_, i) => i <= atIndex)
         .at(-1) ?? ''
   )
}

export function chunkArrayInGroups<T>(arr: T[], size: number): T[][] {
   const myArray = []
   for (let i = 0; i < arr.length; i += size) {
      myArray.push(arr.slice(i, i + size))
   }
   return myArray
}

export const getOS = () => {
   const userAgent = window.navigator.userAgent.toLowerCase(),
      macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i,
      windowsPlatforms = /(win32|win64|windows|wince)/i,
      iosPlatforms = /(iphone|ipad|ipod)/i,
      os = null

   if (macosPlatforms.test(userAgent)) {
      return 'macos'
   } else if (iosPlatforms.test(userAgent)) {
      return 'ios'
   } else if (windowsPlatforms.test(userAgent)) {
      return 'windows'
   } else if (/android/.test(userAgent)) {
      return 'android'
   } else if (!os && /linux/.test(userAgent)) {
      return 'linux'
   }
}
