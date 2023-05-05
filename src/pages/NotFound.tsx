import { useNavigate } from 'react-router-dom'

import { Button } from '@/lib/component/Button'
import Hero from '@/lib/component/Hero'
import { nonNullable } from '@/util/Utils'

export const NotFound = ({ redirect, label }: { redirect?: string; label: string }) => {
   const nav = useNavigate()
   const goBack = () => (nonNullable(redirect) ? nav(redirect) : nav(-1))

   return (
      <Hero>
         <div className='max-w-md'>
            <h1 className='text-5xl font-bold'>Not Found!</h1>
            <p className='py-6'>Doesn't seem like there's anything here...</p>
            <Button onClick={goBack}>{label}</Button>
         </div>
      </Hero>
   )
}
