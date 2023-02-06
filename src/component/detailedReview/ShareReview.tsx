import { ReactNode, useEffect, useMemo } from 'react'
import { Dialog } from '@headlessui/react'
import {
   AccessLevel,
   CollaboratorFragment,
   useProfileAndReviewsQuery,
   useShareReviewMutation,
} from 'graphql/generated/schema'
import toast from 'react-hot-toast'
import { ThemeModal } from 'platform/component/ThemeModal'
import useStateWithReset from 'platform/hook/useStateWithReset'
import Portal from 'platform/component/Portal'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowUturnLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'

export interface ShareReviewProps {
   reviewId: string
   collaborators: CollaboratorFragment[]
   onChange?: () => void
   children: ReactNode
}

export function ShareReview({ reviewId, onChange, collaborators: collabProp, children }: ShareReviewProps) {
   const [accessLevel, setAccessLevel, resetAccessLevel] = useStateWithReset(AccessLevel.Viewer)
   const [username, setUsername, resetUsername] = useStateWithReset('')
   const [isModalOpen, setModalOpen, resetModalOpen] = useStateWithReset(false)
   const [collaborators, setCollaborators, resetCollaborators] = useStateWithReset(collabProp)

   useEffect(() => {
      setCollaborators(collabProp)
   }, [collabProp, setCollaborators])

   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { mutate: shareReview, isLoading } = useShareReviewMutation({
      onError: () => toast.error('Failed to update review sharing.'),
      onSuccess: () => {
         if (onChange) {
            onChange()
         }
         resetReviewOverviews()
      },
   })

   const onSubmit = async () => {
      const addCollaborator = (() => {
         if (username.length !== 0) {
            const variables = { input: { reviewId, accessLevel, userId: username } }
            return shareReview(variables)
         } else {
            return Promise.resolve(null)
         }
      })()

      // Delete all removed collaborators.
      const removeCollaborators = collabProp
         .filter(c => !collaborators.find(c2 => c2.user.id === c.user.id))
         .map(c => ({ input: { reviewId, userId: c.user.id } }))
         .map(variables => shareReview(variables))

      try {
         await Promise.all([addCollaborator, ...removeCollaborators])
      } catch (e) {
         toast.error('Failed to update review sharing.')
      }
   }

   const onCancel = () => {
      resetAccessLevel()
      resetUsername()
      resetModalOpen()
      resetCollaborators()
   }

   const disabledUndo = useMemo(() => collaborators.length === collabProp.length, [collaborators, collabProp])

   const disabled = useMemo(() => isLoading || (username.length === 0 && disabledUndo), [username, disabledUndo])

   return (
      <>
         <Portal>
            <ThemeModal open={isModalOpen} className='min-h-96 h-fit w-96 '>
               <div className='flex flex-col items-center justify-between space-y-2 p-3'>
                  <Dialog.Title className='text-lg font-bold'>Share Review</Dialog.Title>

                  {collabProp.length > 0 && (
                     <>
                        <div className='form-control w-full'>
                           <label className='label'>
                              <span className='label-text font-bold'> Shared With </span>
                           </label>
                           {/* TODO: do I need this color? */}
                           <ul className='menu h-32 flex-nowrap divide-y divide-base-200 overflow-y-scroll bg-base-200'>
                              {collaborators.map(c => (
                                 <li key={c.user.id}>
                                    <div className='group flex flex-row'>
                                       <p className='basis-full'>{c.user.id}</p>
                                       <p className='basis-full'>{c.accessLevel}</p>
                                       <button
                                          className='btn btn-error btn-xs opacity-0 group-hover:opacity-100'
                                          onClick={() =>
                                             setCollaborators(collaborators.filter(c2 => c2.user.id !== c.user.id))
                                          }
                                       >
                                          <XMarkIcon className='h-4 w-4' />
                                       </button>
                                    </div>
                                 </li>
                              ))}
                           </ul>
                        </div>
                        <div className='divider-primary divider' />
                     </>
                  )}
                  <div className='form-control w-full'>
                     <label className='label'>
                        <span className='label-text font-bold'>Add Collaborator</span>
                     </label>
                     <input
                        type='text'
                        placeholder='Spotify ID'
                        className='input input-bordered w-full'
                        onChange={e => setUsername(e.target.value as string)}
                        value={username}
                     />
                  </div>
                  <div className='form-control w-full'>
                     <label className='label'>
                        <span className='label-text font-bold'>Access Level</span>
                     </label>
                     <select
                        value={accessLevel}
                        onChange={e => setAccessLevel(e.target.value as AccessLevel)}
                        className='select select-bordered w-full'
                     >
                        {Object.values(AccessLevel).map(a => (
                           <option key={a} value={a}>
                              {a}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className='flex w-full flex-row items-center justify-around'>
                     <button className='btn btn-success disabled:btn-outline' onClick={onSubmit} disabled={disabled}>
                        <span className='hidden md:block'>Confirm</span>
                        <CheckIcon className='h-5 w-5' />
                     </button>

                     <button
                        className='btn btn-info gap-2'
                        disabled={disabledUndo}
                        onClick={() => setCollaborators(collabProp)}
                     >
                        <span className='hidden md:block'>Undo</span>
                        <ArrowUturnLeftIcon className='h-5 w-5' />
                     </button>
                     <button className='btn btn-info gap-2' onClick={onCancel}>
                        <span className='hidden md:block'>Cancel</span>
                        <XMarkIcon className='h-5 w-5' />
                     </button>
                  </div>
               </div>
            </ThemeModal>
         </Portal>
         <button className='btn btn-primary btn-sm lg:btn-md' onClick={() => setModalOpen(true)}>
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
