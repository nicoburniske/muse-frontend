import { useEffect } from 'react'
import { useSeekInterval, useSetSeekInterval } from 'state/UserPreferences'
import { Input } from 'lib/component/Input'
import { cn } from 'util/Utils'
import { z } from 'zod'
import { Button } from 'lib/component/Button'
import { CheckIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const SeekIntervalSchema = z.object({
   seekInterval: z.coerce.number().min(1).max(120),
})

type SeekIntervalInputType = z.infer<typeof SeekIntervalSchema>

export const SeekIntervalSetter = () => {
   // seek interval is stored in milliseconds.
   const seekInterval = useSeekInterval() / 1000
   const setSeekInterval = useSetSeekInterval()

   const {
      register,
      reset,
      handleSubmit,
      formState: { isValid, isDirty },
   } = useForm<SeekIntervalInputType>({
      resolver: zodResolver(SeekIntervalSchema),
      defaultValues: { seekInterval },
   })

   const submitDisabled = !isDirty || !isValid

   const submit = handleSubmit(input => {
      setSeekInterval(input.seekInterval * 1000)
   })

   useEffect(() => {
      reset({ seekInterval })
   }, [seekInterval])

   return (
      <div>
         <div className='flex flex-col gap-2'>
            <label htmlFor='seekInterval' className='block text-sm font-medium text-foreground'>
               Seek interval (seconds)
            </label>
            <form className='flex gap-2' onSubmit={submit}>
               <Input id='seekInterval' type='number' className={cn('w-full')} {...register('seekInterval')} />
               <Button disabled={submitDisabled}>
                  <CheckIcon className='h-4 w-4' />
               </Button>
            </form>
         </div>
      </div>
   )
}
