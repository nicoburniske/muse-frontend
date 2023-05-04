import { useOpenTour } from 'lib/hook/useOpenTour'
import { useEffect } from 'react'

export const useOpenReviewTour = () => useOpenTour(detailedReviewSteps, 0)

const localStorageKey = 'MuseNeedToGiveDetailedReviewTour'
export const useOpenReviewTourFirstTime = () => {
   const openTour = useOpenReviewTour()
   useEffect(() => {
      if (localStorage.getItem(localStorageKey) === null) {
         setTimeout(() => {
            openTour()
            localStorage.setItem(localStorageKey, '')
         }, 500)
      }
   }, [])
}

const detailedReviewSteps = [
   {
      selector: '.muse-tracks',
      content: 'Tracks are shown here',
   },
   {
      selector: '.muse-track',
      content: (
         <>
            <p>Comment on a track to share your thoughts.</p>
            <br />
            <p>You can use markdown to format your comments and link parts of songs in your comments</p>
            <br />
            <p>For example</p>
            <article className='prose'>
               <blockquote>
                  <p>I really love this part @0:30</p>
               </blockquote>
            </article>
         </>
      ),
   },
   {
      selector: '.muse-comments',
      content: (
         <>
            <p> Comments you make will appear here. You can:</p>
            <br />
            <ul>
               <li>Reply to comments</li>
               <li>Update & Delete your comments</li>
               <li>And re-order comments!</li>
            </ul>
         </>
      ),
   },
   {
      selector: '.muse-share',
      content: (
         <>
            <p>Reviews are more fun when they're collaborative. So go ahead and share them!</p>
            <br />
            <p>P.S. Comments are shared live so you can collaborate in real time.</p>
         </>
      ),
   },
]
