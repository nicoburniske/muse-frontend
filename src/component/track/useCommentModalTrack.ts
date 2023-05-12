import { useOpenNewComment } from '../commentForm/useOpenNewComment'

export const useCommentModalTrack = (reviewId: string, trackId: string, invalidate = false) => {
   const open = useOpenNewComment()

   return () => {
      const values = { title: 'Create Comment', trackId, reviewId }
      open(values)
   }
}
