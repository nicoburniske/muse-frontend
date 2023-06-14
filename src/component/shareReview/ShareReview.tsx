import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import toast from 'react-hot-toast'

import { SearchUsersComboBox } from '@/component/shareReview/SearchUsersCombobox'
import { UserWithAccessLevel } from '@/component/shareReview/UserWithAccessLevel'
import { AccessLevel, useShareReviewMutation } from '@/graphql/generated/schema'
import { makeModalAtoms } from '@/lib/atom/makeModalAtoms'
import { Button } from '@/lib/component/Button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/lib/component/Dialog'
import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectItemText,
   SelectTrigger,
   SelectValue,
} from '@/lib/component/Select'
import { Separator } from '@/lib/component/Seperator'
import useStateWithReset from '@/lib/hook/useStateWithReset'
import { useCollaboratorsQuery, useInvalidateDetailedReviewCache } from '@/state/useDetailedReviewCacheQuery'

const { setOpen, setClose, valueAtom: reviewIdAtom, openAtom } = makeModalAtoms<string | null, string>(null)

export const useShareReview = () => {
   return {
      openShareReview: useSetAtom(setOpen),
      closeShareReview: useSetAtom(setClose),
   }
}
export const ShareReviewModal = () => {
   const reviewId = useAtomValue(reviewIdAtom)
   const [open, setOpen] = useAtom(openAtom)
   const close = useSetAtom(setClose)

   return (
      <Dialog
         open={open}
         onOpenChange={open => {
            if (!open) {
               close()
            }
         }}
      >
         {reviewId && <ShareReview reviewId={reviewId} />}
      </Dialog>
   )
}

function ShareReview({ reviewId }: { reviewId: string }) {
   const [accessLevel, setAccessLevel, resetAccessLevel] = useStateWithReset<AccessLevel>('Viewer')
   const [username, setUsername, resetUsername] = useStateWithReset('')

   const invalidate = useInvalidateDetailedReviewCache(reviewId)

   const { mutate: shareReview, isLoading } = useShareReviewMutation({
      onError: () => toast.error('Failed to update review sharing.'),
      onSuccess: () => {
         invalidate()
         reset()
         toast.success('Updated review sharing.', { id: 'share-review-toast' })
      },
   })

   const onSubmit = async () => {
      if (username.length !== 0) {
         const variables = { input: { reviewId, accessLevel, userId: username } }
         return shareReview(variables)
      }
   }
   const reset = () => {
      resetAccessLevel()
      resetUsername()
   }

   const disabled = isLoading || username.length === 0

   const { data: collaboratorData } = useCollaboratorsQuery(reviewId)
   const collaborators = collaboratorData ?? []

   return (
      <DialogContent>
         <DialogHeader>
            <DialogTitle>Share Review</DialogTitle>
            <DialogDescription>Make changes to who can view and edit this review.</DialogDescription>
         </DialogHeader>
         <div className='flex flex-col items-center space-y-3'>
            {collaborators?.length > 0 && (
               <>
                  <div className='w-full'>
                     <label className=''>
                        <span className='block text-sm font-medium'> Collaborators </span>
                     </label>
                     <ul className='h-32 flex-nowrap space-y-2 overflow-y-scroll'>
                        {collaborators.map(c => (
                           <li key={c.user.id}>
                              <UserWithAccessLevel user={c} reviewId={reviewId} />
                           </li>
                        ))}
                     </ul>
                  </div>
                  <Separator />
               </>
            )}
            <SearchUsersComboBox onSelect={(userId: string) => setUsername(userId)} />
            <div className='w-full'>
               <label className=''>
                  <span className='block text-sm font-medium'>Access Level</span>
               </label>
               <Select onValueChange={v => setAccessLevel(v as AccessLevel)} defaultValue={accessLevel}>
                  <SelectTrigger>
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectGroup>
                        <SelectItem value='Collaborator'>
                           <SelectItemText>Editor</SelectItemText>
                        </SelectItem>
                        <SelectItem value='Viewer'>
                           <SelectItemText>Viewer</SelectItemText>
                        </SelectItem>
                     </SelectGroup>
                  </SelectContent>
               </Select>
            </div>
            <DialogFooter className='w-full'>
               <Button className='space-x-2' onClick={onSubmit} disabled={disabled}>
                  Confirm
               </Button>
            </DialogFooter>
         </div>
      </DialogContent>
   )
}

// const { mutate: copy } = useCopyToClipboard({ onSuccess: () => toast.success('Copied to clipboard!') })
// const copyLink = () => copy(`https://muselabs.xyz/app/reviews/${reviewId}`)

// <button className='btn btn-info gap-2' onClick={copyLink}>
//    <ClipboardDocumentCheckIcon className='h-5 w-5' />
// </button>
