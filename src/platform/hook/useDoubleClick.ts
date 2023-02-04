import { RefObject, useEffect } from 'react'

export default function useDoubleClick({
   ref,
   latency = 300,
   onSingleClick = () => null,
   onDoubleClick = () => null,
}: {
   ref: RefObject<HTMLElement>
   latency?: number
   onSingleClick?: () => void
   onDoubleClick?: () => void
}) {
   useEffect(() => {
      const clickRef = ref.current
      if (clickRef == null) return

      let clickCount = 0
      const handleClick = () => {
         clickCount += 1

         setTimeout(() => {
            if (clickCount === 1) onSingleClick()
            else if (clickCount >= 2) onDoubleClick()

            clickCount = 0
         }, latency)
      }

      // Add event listener for click events
      clickRef.addEventListener('click', handleClick)

      // Remove event listener
      return () => {
         clickRef.removeEventListener('click', handleClick)
      }
   })
}
