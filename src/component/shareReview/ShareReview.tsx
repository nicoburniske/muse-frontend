import { ReactNode } from 'react'
import { Dialog } from '@headlessui/react'
import { AccessLevel, CollaboratorFragment, useShareReviewMutation } from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { ThemeModal } from 'platform/component/ThemeModal'
import useStateWithReset from 'platform/hook/useStateWithReset'
import Portal from 'platform/component/Portal'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { UserWithAccessLevel } from 'component/shareReview/UserWithAccessLevel'
import { SearchUsersComboBox } from 'component/shareReview/SearchUsersCombobox'
import { useCollaboratorsQuery, useInvalidateDetailedReviewCache } from 'state/useDetailedReviewCacheQuery'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { cn } from 'util/Utils'

export interface ShareReviewProps {
   reviewId: string
   collaborators: CollaboratorFragment[]
   children: ReactNode
}

export function ShareReview({ reviewId, children }: ShareReviewProps) {
   const [accessLevel, setAccessLevel, resetAccessLevel] = useStateWithReset<AccessLevel>('Viewer')
   const [username, setUsername, resetUsername] = useStateWithReset('')
   const [isModalOpen, setModalOpen, resetModalOpen] = useStateWithReset(false)

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

   const onCancel = () => {
      reset()
      resetModalOpen()
   }

   const disabled = isLoading || username.length === 0

   const { data: collaboratorData } = useCollaboratorsQuery(reviewId)
   const collaborators = collaboratorData ?? []

   return (
      <>
         <Portal>
            <ThemeModal open={isModalOpen} className='min-h-96 h-fit w-96' onClose={onCancel}>
               <div className='relative flex flex-col items-center justify-between space-y-2 p-3'>
                  <Dialog.Title className='text-lg font-bold'>Share Review</Dialog.Title>

                  {collaborators?.length > 0 && (
                     <>
                        <div className='form-control w-full'>
                           <label className='label'>
                              <span className='label-text font-bold'> Shared With </span>
                           </label>
                           <ul className='h-32 flex-nowrap space-y-2 overflow-y-scroll'>
                              {collaborators.map(c => (
                                 <li key={c.user.id}>
                                    <UserWithAccessLevel user={c} reviewId={reviewId} />
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className='divider-primary divider' />
                     </>
                  )}
                  <SearchUsersComboBox onSelect={(userId: string) => setUsername(userId)} />
                  <div className='form-control w-full'>
                     <label className='label'>
                        <span className='label-text font-bold'>Access Level</span>
                     </label>
                     <select
                        value={accessLevel}
                        onChange={e => setAccessLevel(e.target.value as AccessLevel)}
                        className='select select-bordered w-full'
                     >
                        {(['Viewer', 'Collaborator'] as AccessLevel[]).map(a => (
                           <option key={a} value={a}>
                              {a}
                           </option>
                        ))}
                     </select>
                  </div>
                  <button className='btn btn-success disabled:btn-outline' onClick={onSubmit} disabled={disabled}>
                     {isLoading ? (
                        <ArrowPathIcon className={cn('h-6 w-6 animate-spin')} aria-hidden='true' />
                     ) : (
                        <>
                           <span className='hidden md:block'>Confirm</span>
                           <CheckIcon className='h-6 w-6' aria-hidden='true' />
                        </>
                     )}
                  </button>

                  <button className='btn btn-square btn-error btn-sm absolute top-0 right-2' onClick={onCancel}>
                     <XMarkIcon className='h-6 w-6' />
                  </button>
               </div>
            </ThemeModal>
         </Portal>
         <button className='muse-share btn btn-primary btn-sm lg:btn-md' onClick={() => setModalOpen(true)}>
            {children}
         </button>
      </>
   )
}

// const { mutate: copy } = useCopyToClipboard({ onSuccess: () => toast.success('Copied to clipboard!') })
// const copyLink = () => copy(`https://muselabs.xyz/app/reviews/${reviewId}`)

// <button className='btn btn-info gap-2' onClick={copyLink}>
//    <ClipboardDocumentCheckIcon className='h-5 w-5' />
// </button>
