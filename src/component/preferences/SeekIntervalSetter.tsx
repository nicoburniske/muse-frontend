import { useEffect, useState } from 'react'
import { useSeekInterval, useSetSeekInterval } from 'state/UserPreferences'
import { cn } from 'util/Utils'
import { z } from 'zod'

const seekIntervalSchema = z.coerce
   .number()
   .min(1)
   .max(120)
   .transform(seek => seek * 1000)

export const SeekIntervalSetter = () => {
   // seek interval is stored in milliseconds.
   const seekInterval = useSeekInterval()
   const setSeekInterval = useSetSeekInterval()

   const [tempInterval, setTempInterval] = useState<string>((seekInterval / 1000).toString())
   const [errors, setErrors] = useState<string[]>([])
   const hasErrors = errors.length > 0

   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempInterval(e.target.value)
   }

   useEffect(() => {
      const parsed = seekIntervalSchema.safeParse(tempInterval)
      if (parsed.success) {
         setErrors([])
         setSeekInterval(parsed.data)
      } else {
         const messages = parsed.error.issues.map(i => i.message)
         setErrors(messages)
      }
   }, [tempInterval])

   return (
      <div>
         <div className='relative'>
            <label htmlFor='seekInterval' className='block text-sm font-bold text-base-content'>
               Seek interval (seconds)
            </label>
            <input
               type='number'
               name='number'
               id='seekInterval'
               className={cn('input input-bordered w-full sm:text-sm', hasErrors ? 'input-error text-error' : '')}
               value={tempInterval}
               onChange={onChange}
               aria-invalid='true'
               aria-describedby='number-error'
            />
         </div>
         <p className='mt-2 h-6 text-sm text-error'>{errors.join(',')}</p>
      </div>
   )
}
