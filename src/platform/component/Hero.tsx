import { ReactNode } from 'react'

export default function Hero({ children }: { children: ReactNode }) {
   return (
      <div className='hero h-max'>
         <div className='hero-content flex-col lg:flex-row'>
            <div className='absolute right-1/2 bottom-1/2  translate-x-1/2 translate-y-1/2 transform '>{children}</div>
         </div>
      </div>
   )
}
