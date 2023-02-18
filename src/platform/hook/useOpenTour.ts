import { StepType, useTour } from '@reactour/tour'

export const useOpenTour = (steps?: StepType[], fromStep?: number) => {
   const { setSteps, setIsOpen, setCurrentStep } = useTour()
   return () => {
      if (setSteps && steps) {
         setSteps(steps)
      }
      if (setCurrentStep && fromStep) {
         setCurrentStep(fromStep)
      }
      setIsOpen(true)
   }
}
