import { ReactNode } from 'react'
import { AccessLevel, CollaboratorFragment, useShareReviewMutation } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import useStateWithReset from 'platform/hook/useStateWithReset'
import Portal from 'platform/component/Portal'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { UserWithAccessLevel } from 'component/shareReview/UserWithAccessLevel'
import { SearchUsersComboBox } from 'component/shareReview/SearchUsersCombobox'
import { useCollaboratorsQuery, useInvalidateDetailedReviewCache } from 'state/useDetailedReviewCacheQuery'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { cn } from 'util/Utils'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from 'platform/component/Dialog'
import { Switch } from 'platform/component/Switch'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from 'platform/component/Select'
import { Button } from 'platform/component/Button'
import { Separator } from 'platform/component/Seperator'

export interface ShareReviewProps {
   reviewId: string
   collaborators: CollaboratorFragment[]
   children: ReactNode
}

export function ShareReview({ reviewId, children }: ShareReviewProps) {
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
      <Dialog>
         <DialogTrigger>{children}</DialogTrigger>

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
                  <label className='label'>
                     <span className='label-text font-bold'>Access Level</span>
                  </label>
                  <Select onValueChange={v => setAccessLevel(v as AccessLevel)} defaultValue={accessLevel}>
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectGroup>
                           <SelectItem value='Collaborator'>Editor</SelectItem>
                           <SelectItem value='Viewer'>Viewer</SelectItem>
                        </SelectGroup>
                     </SelectContent>
                  </Select>
               </div>
               <DialogFooter>
                  <Button className='space-x-2' onClick={onSubmit} disabled={disabled}>
                     Confirm
                  </Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
   )
}

// const { mutate: copy } = useCopyToClipboard({ onSuccess: () => toast.success('Copied to clipboard!') })
// const copyLink = () => copy(`https://muselabs.xyz/app/reviews/${reviewId}`)

// <button className='btn btn-info gap-2' onClick={copyLink}>
//    <ClipboardDocumentCheckIcon className='h-5 w-5' />
// </button>
