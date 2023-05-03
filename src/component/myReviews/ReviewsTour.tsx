import { useOpenTour } from 'platform/hook/useOpenTour'
import { useEffect } from 'react'

const localStorageKey = 'MuseNeedToGiveReviewsTour'

export const useOpenReviewsTour = () => useOpenTour(steps, 0)
export const useOpenReviewsTourFirstTime = (ready: boolean) => {
   const openTour = useOpenReviewsTour()
   useEffect(() => {
      if (ready) {
         const value = localStorage.getItem(localStorageKey)
         if (value === null) {
            setTimeout(() => {
               openTour()
               localStorage.setItem(localStorageKey, '')
            }, 500)
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
