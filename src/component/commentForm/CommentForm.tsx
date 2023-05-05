import { MutableRefObject, useRef, useState } from 'react'

import CommentMarkdown from '@/component/comment/CommentMarkdown'
import { Button } from '@/lib/component/Button'
import { CardContent, CardFooter, CardHeader } from '@/lib/component/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/component/Tabs'
import { Textarea } from '@/lib/component/TextArea'
import { cn } from '@/util/Utils'

export interface CommentFormProps {
   initialValue?: string
   // This promise should not throw.
   onSubmit: (comment: string) => Promise<void>
   trackId: string
}

export function CommentForm({ onSubmit, initialValue = '', trackId }: CommentFormProps) {
   const commentInputRef = useRef() as MutableRefObject<HTMLTextAreaElement>
   const [comment, setComment] = useState(initialValue)
   const [isSubmitting, setIsSubmitting] = useState(false)

   const submitAndReset = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault()
      setIsSubmitting(true)
      try {
         await onSubmit(comment)
      } catch (e) {
         /* empty */
      } finally {
         setIsSubmitting(false)
      }
   }

   const applyToSelected = (apply: (substring: string) => string) => {
      const { selectionStart, selectionEnd, value } = commentInputRef.current
      const substring = value.substring(selectionStart, selectionEnd)
      const newValue = value.replace(substring, apply(substring))
      setComment(newValue)
   }
   const blockQuoteSelected = () => {
      applyToSelected(str =>
         str
            .split('\n')
            .filter(s => s.trim() !== '')
            .map(str => `> ${str}`)
            .join('\n\n')
      )
   }
   const boldSelected = () => {
      applyToSelected(s => `**${s}**`)
   }
   const italicSelected = () => {
      applyToSelected(s => `*${s}*`)
   }

   const canSubmit = comment != initialValue

   return (
      <>
         <div className={cn('rounded-lg border-0 shadow-sm')}>
            <Tabs defaultValue={'Write'}>
               <CardHeader>
                  <TabsList>
                     <TabsTrigger value={'Write'}>Write</TabsTrigger>
                     <TabsTrigger value={'Preview'}>Preview</TabsTrigger>
                     <div className='ml-auto hidden items-center space-x-5 sm:flex'>
                        <div className='flex items-center'>
                           <button
                              type='button'
                              className='-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/50 hover:text-foreground'
                              onClick={blockQuoteSelected}
                           >
                              <span className='sr-only'>Block comment selected text</span>
                              <QuoteIcon />
                           </button>
                        </div>

                        <div className='flex items-center'>
                           <button
                              type='button'
                              className='-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/50 hover:text-foreground'
                              onClick={boldSelected}
                           >
                              <span className='sr-only'>Bold selected text</span>
                              <BoldIcon />
                           </button>
                        </div>

                        <div className='flex items-center'>
                           <button
                              type='button'
                              className='-m-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/50 hover:text-foreground'
                              onClick={italicSelected}
                           >
                              <span className='sr-only'>Italicize selected text</span>
                              <ItalicIcon />
                           </button>
                        </div>
                     </div>
                  </TabsList>
               </CardHeader>
               <CardContent className='p-4'>
                  <TabsContent value={'Write'}>
                     <label htmlFor='comment' className='sr-only'>
                        Comment
                     </label>
                     <div>
                        <Textarea
                           ref={commentInputRef}
                           rows={10}
                           placeholder='Add your comment...'
                           className='h-64'
                           onChange={e => setComment(e.target.value as string)}
                           value={comment}
                        />
                     </div>
                  </TabsContent>
                  <TabsContent value={'Preview'}>
                     <div className='prose mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5'>
                        <CommentMarkdown trackId={trackId} comment={comment} />
                     </div>
                  </TabsContent>
               </CardContent>
            </Tabs>
            <CardFooter className='flex justify-between'>
               <Button onClick={submitAndReset} disabled={!canSubmit || isSubmitting}>
                  Submit
               </Button>
            </CardFooter>
         </div>
      </>
   )
}

const BoldIcon = () => (
   <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
         d='M5.10505 12C4.70805 12 4.4236 11.912 4.25171 11.736C4.0839 11.5559 4 11.2715 4 10.8827V4.11733C4 3.72033 4.08595 3.43588 4.25784 3.26398C4.43383 3.08799 4.71623 3 5.10505 3C6.42741 3 8.25591 3 9.02852 3C10.1373 3 11.0539 3.98153 11.0539 5.1846C11.0539 6.08501 10.6037 6.81855 9.70327 7.23602C10.8657 7.44851 11.5176 8.62787 11.5176 9.48128C11.5176 10.5125 10.9902 12 9.27734 12C8.77742 12 6.42626 12 5.10505 12ZM8.37891 8.00341H5.8V10.631H8.37891C8.9 10.631 9.6296 10.1211 9.6296 9.29877C9.6296 8.47643 8.9 8.00341 8.37891 8.00341ZM5.8 4.36903V6.69577H8.17969C8.53906 6.69577 9.27734 6.35939 9.27734 5.50002C9.27734 4.64064 8.48047 4.36903 8.17969 4.36903H5.8Z'
         fill='currentColor'
      ></path>
   </svg>
)

const ItalicIcon = () => (
   <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
         d='M5.67494 3.50017C5.67494 3.25164 5.87641 3.05017 6.12494 3.05017H10.6249C10.8735 3.05017 11.0749 3.25164 11.0749 3.50017C11.0749 3.7487 10.8735 3.95017 10.6249 3.95017H9.00587L7.2309 11.05H8.87493C9.12345 11.05 9.32493 11.2515 9.32493 11.5C9.32493 11.7486 9.12345 11.95 8.87493 11.95H4.37493C4.1264 11.95 3.92493 11.7486 3.92493 11.5C3.92493 11.2515 4.1264 11.05 4.37493 11.05H5.99397L7.76894 3.95017H6.12494C5.87641 3.95017 5.67494 3.7487 5.67494 3.50017Z'
         fill='currentColor'
         fillRule='evenodd'
         clipRule='evenodd'
      ></path>
   </svg>
)

const QuoteIcon = () => (
   <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
         d='M9.42503 3.44136C10.0561 3.23654 10.7837 3.2402 11.3792 3.54623C12.7532 4.25224 13.3477 6.07191 12.7946 8C12.5465 8.8649 12.1102 9.70472 11.1861 10.5524C10.262 11.4 8.98034 11.9 8.38571 11.9C8.17269 11.9 8 11.7321 8 11.525C8 11.3179 8.17644 11.15 8.38571 11.15C9.06497 11.15 9.67189 10.7804 10.3906 10.236C10.9406 9.8193 11.3701 9.28633 11.608 8.82191C12.0628 7.93367 12.0782 6.68174 11.3433 6.34901C10.9904 6.73455 10.5295 6.95946 9.97725 6.95946C8.7773 6.95946 8.0701 5.99412 8.10051 5.12009C8.12957 4.28474 8.66032 3.68954 9.42503 3.44136ZM3.42503 3.44136C4.05614 3.23654 4.78366 3.2402 5.37923 3.54623C6.7532 4.25224 7.34766 6.07191 6.79462 8C6.54654 8.8649 6.11019 9.70472 5.1861 10.5524C4.26201 11.4 2.98034 11.9 2.38571 11.9C2.17269 11.9 2 11.7321 2 11.525C2 11.3179 2.17644 11.15 2.38571 11.15C3.06497 11.15 3.67189 10.7804 4.39058 10.236C4.94065 9.8193 5.37014 9.28633 5.60797 8.82191C6.06282 7.93367 6.07821 6.68174 5.3433 6.34901C4.99037 6.73455 4.52948 6.95946 3.97725 6.95946C2.7773 6.95946 2.0701 5.99412 2.10051 5.12009C2.12957 4.28474 2.66032 3.68954 3.42503 3.44136Z'
         fill='currentColor'
         fillRule='evenodd'
         clipRule='evenodd'
      ></path>
   </svg>
)
