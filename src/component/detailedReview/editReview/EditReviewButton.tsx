import { useState } from 'react'
import Portal from 'platform/component/Portal'
import { EditReview } from './EditReview'

type EditReviewButtonProps = {
   reviewId: string
   reviewName: string
   isPublic: boolean
   onSuccess: () => void
   children: (onClick: () => void) => React.ReactElement
}

export const EditReviewButton = (props: EditReviewButtonProps) => {
   const [isOpen, setIsOpen] = useState(false)
   return (
      <>
         <Portal>
            <EditReview {...props} isOpen={isOpen} onCancel={() => setIsOpen(false)} />
         </Portal>
         {props.children(() => setIsOpen(true))}
      </>
   )
}
