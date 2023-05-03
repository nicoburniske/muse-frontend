export const useSimulateRightClick = <T extends HTMLElement>(
   containerRef: React.RefObject<T>,
   referenceRef: React.RefObject<T>
) => {
   return () => {
      const current = containerRef.current
      const optionsCurrent = referenceRef.current
      if (current && optionsCurrent) {
         const bound = optionsCurrent.getBoundingClientRect()
         current.dispatchEvent(
            new MouseEvent('contextmenu', {
               bubbles: true,
               clientX: bound.x + bound.width - 20,
               clientY: bound.y + bound.height / 2,
            })
         )
      }
   }
}
