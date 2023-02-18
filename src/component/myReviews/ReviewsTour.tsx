import { Atom, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useOnFirstMountAtom } from 'platform/hook/useOnFirstMount'
import { useOpenTour } from 'platform/hook/useOpenTour'
import { useMemo } from 'react'

const needToGiveTourAtom = atomWithStorage('MuseNeedToGiveReviewsTour', true)

export const useOpenReviewsTour = () => useOpenTour(steps)
export const useOpenReviewsTourFirstTime = (ready: boolean) =>
   useOnFirstMountAtom(
      useMemo(() => atom(get => get(needToGiveTourAtom) && ready), [ready]),
      needToGiveTourAtom,
      useOpenReviewsTour()
   )

const steps = [
   {
      selector: '.muse-player',
      content: 'Welcome to Muse! You can control your Spotify playback here.',
   },
   {
      selector: '.muse-power-on-button,.muse-play-button',
      content: 'Start up your player with the power button. Make sure you have Spotify open on one of your devices!',
   },
   {
      selector: '.muse-finder',
      content: 'You can scroll to the current playing track by clicking the Magnifying Glass.',
   },
   {
      selector: '.muse-preferences',
      content: 'You can also tweak your preferences. Find a theme you mess with!',
   },
   {
      selector: '.muse-review-card-image',
      content: 'Open the Review Details Sidebar by clicking on a review card image.',
   },
   {
      selector: '.muse-review-card-title',
      content: 'Open the Review by clicking on the review title.',
   },
   {
      selector: '.body',
      content: "That's it! You're all set to start reviewing.",
   },
]
