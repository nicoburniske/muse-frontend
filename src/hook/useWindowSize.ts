import { useState, useEffect } from "react";
export interface Size {
    width: number
    height: number
    isSm: boolean
    isMd: boolean
    isLg: boolean
    isXl: boolean
}

export default function useWindowSize(): Size {
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
        // Add event listener
        window.addEventListener("resize", handleResize)
        // Call handler right away so state gets updated with initial window size
        handleResize()
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize)
    }, []) // Empty array ensures that effect is only run on mount
    return windowSize
}