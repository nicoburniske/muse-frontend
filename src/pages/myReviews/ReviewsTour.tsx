import { useCallback, useEffect } from 'react'

import { useOpenTour } from '@/lib/hook/useOpenTour'
import { nonNullable } from '@/util/Utils'

const localStorageKey = 'MuseNeedToGiveReviewsTour'

export const useOpenReviewsTour = () => {
   const open = useOpenTour()
   return useCallback(() => {
      const validSteps = steps.filter(step => nonNullable(document.body.querySelector(step.selector)))
      open(validSteps)
   }, [open])
}
export const useOpenReviewsTourFirstTime = (ready: boolean) => {
   const openTour = useOpenReviewsTour()
   useEffect(() => {
      if (ready) {
         const value = localStorage.getItem(localStorageKey)
         if (value === null) {
            setTimeout(() => {
               openTour()
               localStorage.setItem(localStorageKey, '')
            }, 1000)
         }
      }
   }, [ready])
}

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
      selector: '.muse-cmd',
      content:
         "This opens your command menu. If there's ever something you want to find, or an action you want to make (Change Theme, Create/Delete review, Logout), click here!",
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
      selector: '.muse-review-card-details',
      content: 'Open the Review Details Sidebar by clicking this button.',
   },
   {
      selector: '.body',
      content: "That's it! You're all set to start reviewing.",
   },
]
