export function useSimulateRightClick<T extends Element>() {
   return (containerRef: React.RefObject<T>, referenceRef: React.RefObject<T>) => {
      const current = containerRef.current
      const optionsCurrent = referenceRef.current
      if (current && optionsCurrent) {
         const bound = optionsCurrent.getBoundingClientRect()
         current.dispatchEvent(
            new MouseEvent('contextmenu', {
               bubbles: true,
               clientX: bound.x + bound.width / 2,
               clientY: bound.y + bound.height / 2,
            })
         )
      }
   }
}
