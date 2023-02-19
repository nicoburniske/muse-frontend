import { atomWithStorage } from 'jotai/utils'
import { useOnFirstMountAtom } from 'platform/hook/useOnFirstMount'
import { useOpenTour } from 'platform/hook/useOpenTour'

const needToGiveTourAtom = atomWithStorage('MuseNeedToGiveDetailedReviewTour', true)

export const useOpenReviewTourFirstTime = () =>
   useOnFirstMountAtom(needToGiveTourAtom, needToGiveTourAtom, useOpenReviewTour())
export const useOpenReviewTour = () => useOpenTour(detailedReviewSteps, 0)

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
      content: 'Comments you make will appear here. You can reply to, reorder, and delete them.',
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
