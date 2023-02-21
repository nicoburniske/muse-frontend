import { StepType, useTour } from '@reactour/tour'
import { flushSync } from 'react-dom'

export const useOpenTour = (steps?: StepType[], fromStep?: number) => {
   const { setSteps, setIsOpen, setCurrentStep } = useTour()
   return () => {
      flushSync(() => {
         if (setSteps && steps) {
            setSteps(steps)
         }
         if (setCurrentStep && fromStep) {
            setCurrentStep(fromStep)
         }
      })
      setIsOpen(true)
   }
}
