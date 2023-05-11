import { StepType, useTour } from '@reactour/tour'
import { useCallback } from 'react'
import { flushSync } from 'react-dom'

export const useOpenTour = () => {
   const { setSteps, setIsOpen, setCurrentStep } = useTour()
   return useCallback(
      (steps?: StepType[], fromStep?: number) => {
         flushSync(() => {
            if (setSteps && steps) {
               setSteps(steps)
            }
            if (setCurrentStep && fromStep) {
               setCurrentStep(fromStep)
            }
         })
         setIsOpen(true)
      },
      [setSteps, setIsOpen, setCurrentStep]
   )
}
