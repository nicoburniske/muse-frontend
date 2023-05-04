import { ReactNode } from 'react'

export default function Hero({ children }: { children: ReactNode }) {
   return (
      <div className='grid h-max w-full place-items-center'>
         <div className='absolute bottom-1/2 right-1/2  translate-x-1/2 translate-y-1/2 transform '>{children}</div>
      </div>
   )
}
