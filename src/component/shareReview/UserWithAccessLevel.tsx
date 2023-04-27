import { useInvalidateDetailedReviewCache, useIsReviewOwner } from 'state/useDetailedReviewCacheQuery'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from 'platform/component/Select'
import { AccessLevel, CollaboratorFragment, useShareReviewMutation } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useCurrentUserId } from 'state/CurrentUser'
import { cn } from 'util/Utils'
import { Button } from 'platform/component/Button'
import { Badge } from 'platform/component/Badge'

type ShareOption = {
   value: AccessLevel
   display: string
   description: string
}
const ShareOptions: ShareOption[] = [
   { value: 'Viewer', display: 'Viewer', description: 'Can view the review, but not edit it.' },
   { value: 'Collaborator', display: 'Editor', description: 'Can view and make comments on review.' },
]

export const UserWithAccessLevel = ({ user, reviewId }: { user: CollaboratorFragment; reviewId: string }) => {
   const accessLevel = user.accessLevel
   const displayName = user.user.spotifyProfile?.displayName ?? user.user.id ?? ''

   const invalidate = useInvalidateDetailedReviewCache(reviewId)

   const { mutate: shareReview } = useShareReviewMutation({
      onError: () => toast.error('Failed to update review sharing.'),
      onSuccess: () => {
         toast.success('Updated review sharing.', { id: 'share-review-toast' })
         invalidate()
      },
   })

   const setAccessLevel = (accessLevel: AccessLevel) => {
      if (accessLevel !== user.accessLevel) {
         shareReview({ input: { reviewId, userId: user.user.id, accessLevel } })
      }
   }

   const removeUser = () => {
      shareReview({ input: { reviewId, userId: user.user.id } })
   }

   const currentUserId = useCurrentUserId()
   const isEditable = useIsReviewOwner(reviewId, currentUserId)

   return (
      <div className='inline-flex w-full items-center justify-between rounded-md border px-1 shadow-sm'>
         <div className='inline-flex flex-1 items-center justify-between rounded-l-md py-2 pl-3 pr-4 shadow-sm'>
            <Link to={`/app/user/${user.user.id}`}>
               <Button variant='link' size='empty' className='font-normal text-foreground'>
                  {displayName}
               </Button>
            </Link>
            <Badge>{accessLevel === 'Collaborator' ? 'Editor' : 'Viewer'}</Badge>
         </div>
         <Select value={accessLevel} onValueChange={setAccessLevel}>
            <SelectTrigger disabled={!isEditable} className='w-10 border-0' />
            <SelectContent className='flex flex-col '>
               <SelectGroup>
                  {ShareOptions.map(option => (
                     <SelectItem key={option.value} value={option.value} className='my-2'>
                        <div className='flex flex-col'>
                           <div className='flex justify-between'>
                              <p className={'font-semibold'}>{option.display}</p>
                           </div>
                           <p className={cn()}>{option.description}</p>
                        </div>
                     </SelectItem>
                  ))}
               </SelectGroup>

               <div className='grid w-full place-items-center self-center '>
                  <Button variant='destructive' onClick={removeUser}>
                     Remove Collaborator
                  </Button>
               </div>
            </SelectContent>
         </Select>
      </div>
   )
}
