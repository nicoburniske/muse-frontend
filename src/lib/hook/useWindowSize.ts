import { atom, useAtomValue, useSetAtom } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
export interface Size {
   width: number
   height: number
   isSm: boolean
   isMd: boolean
   isLg: boolean
   isXl: boolean
}

const windowSizeAtom = atom<Size>({
   width: 0,
   height: 0,
   isSm: false,
   isMd: false,
   isLg: false,
   isXl: false,
})

export const useWindowSizeAtom = <T>(select: (size: Size) => T) => {
   const setWindowSize = useSetAtom(windowSizeAtom)

   useEffect(() => {
      function handleResize() {
         setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
            isSm: window.innerWidth > 640,
            isMd: window.innerWidth >= 768,
            isLg: window.innerWidth >= 1024,
            isXl: window.innerWidth >= 1280,
         })
      }
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
   }, [setWindowSize])

   return useAtomValue(selectAtom(windowSizeAtom, select))
}

export default function useWindowSize(update = false): Size {
   const [windowSize, setWindowSize] = useState<Size>({
      width: 0,
      height: 0,
      isSm: false,
      isMd: false,
      isLg: false,
      isXl: false,
   })
   useEffect(() => {
      // Handler to call on window resize
      function handleResize() {
         // Set window width/height to state
         setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
            isSm: window.innerWidth < 640,
            isMd: window.innerWidth >= 640,
            isLg: window.innerWidth >= 768,
            isXl: window.innerWidth >= 1024,
         })
      }
      // Call handler right away so state gets updated with initial window size
      handleResize()
      if (update) {
         // Add event listener
         window.addEventListener('resize', handleResize)
         // Remove event listener on cleanup
         return () => window.removeEventListener('resize', handleResize)
      }
   }, []) // Empty array ensures that effect is only run on mount
   return windowSize
}
