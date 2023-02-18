import { useMemo, useState } from 'react'
import CommentMarkdown from '../comment/CommentMarkdown'
import { Tab } from '@headlessui/react'
import { AtSymbolIcon } from '@heroicons/react/24/outline'
import { cn } from 'util/Utils'

export interface CommentFormProps {
   initialValue?: string
   // This promise should not throw.
   onSubmit: (comment: string) => Promise<void>
   onCancel: () => void
   trackId: string
}

export function CommentForm({ onSubmit, onCancel, initialValue = '', trackId }: CommentFormProps) {
   const [comment, setComment] = useState(initialValue)
   const canSubmit = comment != initialValue
   const [isSubmitting, setIsSubmitting] = useState(false)

   const submitAndReset = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault()
      setIsSubmitting(true)
      await onSubmit(comment)
      setIsSubmitting(false)
   }

   const cancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault()
      onCancel()
      setComment(initialValue)
   }

   return (
      <>
         <form className='flex-1 p-5 pb-0'>
            <Tab.Group>
               {({ selectedIndex }) => (
                  <>
                     <Tab.List className='flex items-center text-base-content'>
                        <Tab
                           className={({ selected }) =>
                              cn(
                                 selected
                                    ? 'bg-base-200 font-bold'
                                    : 'bg-base-100  text-base-content/50 hover:bg-base-200',
                                 'rounded-md border border-transparent px-3 py-1.5 text-sm font-medium'
                              )
                           }
                        >
                           Write
                        </Tab>
                        <Tab
                           className={({ selected }) =>
                              cn(
                                 selected
                                    ? 'bg-base-200 font-bold'
                                    : 'bg-base-100  text-base-content/50 hover:bg-base-200 hover:text-base-content',
                                 'rounded-md border border-transparent px-3 py-1.5 text-sm font-medium'
                              )
                           }
                        >
                           Preview
                        </Tab>

                        {selectedIndex === 0 ? (
                           <div className='ml-auto flex items-center space-x-5'>
                              <div className='flex items-center'>
                                 <button
                                    type='button'
                                    className='-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-base-content/50 hover:text-base-content'
                                 >
                                    <span className='sr-only'>Mention someone</span>
                                    <AtSymbolIcon className='h-5 w-5' aria-hidden='true' />
                                 </button>
                              </div>
                           </div>
                        ) : null}
                     </Tab.List>
                     <Tab.Panels className='mt-2'>
                        <Tab.Panel className='-m-0.5 rounded-lg p-0.5'>
                           <label htmlFor='comment' className='sr-only'>
                              Comment
                           </label>
                           <div>
                              <textarea
                                 rows={6}
                                 placeholder='Add your comment...'
                                 className='textarea textarea-bordered w-full grow'
                                 onChange={e => setComment(e.target.value as string)}
                                 value={comment}
                              />
                           </div>
                        </Tab.Panel>
                        <Tab.Panel className='-m-0.5 rounded-lg p-0.5'>
                           <div className='border-b border-primary'>
                              <div className='prose mx-px mt-px px-3 pt-2 pb-12 text-sm leading-5'>
                                 <CommentMarkdown trackId={trackId} comment={comment} />
                              </div>
                           </div>
                        </Tab.Panel>
                     </Tab.Panels>
                  </>
               )}
            </Tab.Group>
            <div className='mt-2 flex justify-end space-x-2'>
               <button className='btn' onClick={cancel} disabled={isSubmitting}>
                  Cancel
               </button>
               <button className='btn btn-primary' onClick={submitAndReset} disabled={!canSubmit || isSubmitting}>
                  Post
               </button>
            </div>
         </form>
      </>
   )
}
