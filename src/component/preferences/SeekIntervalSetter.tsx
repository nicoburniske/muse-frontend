import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import { useSeekInterval, useSetSeekInterval } from 'state/UserPreferences'
import { classNames } from 'util/Utils'
import { z } from 'zod'

const seekIntervalSchema = z.coerce.number().min(1).max(120).transform(seek => seek * 1000)

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
        // <div className="flex flex-row justify-between">
        <div>
            <div className="relative rounded-md shadow-sm " >
                <label htmlFor="seekInterval" className="block text-sm font-bold text-base-content">
                    Seek interval (seconds)
                </label>
                <input
                    type="number"
                    name="number"
                    id="seekInterval"
                    className={classNames(
                        'block w-full rounded-md sm:text-sm input input-bordered input-primary border-base-300',
                        hasErrors ? 'input-error text-error' : ''
                    )}
                    defaultValue={tempInterval}
                    value={tempInterval}
                    onChange={onChange}
                    aria-invalid="true"
                    aria-describedby="number-error"
                />
                {/* {
                    hasErrors && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                    )
                } */}
            </div>
            <p className="mt-2 text-sm text-error h-6" >
                {errors.join(',')}
            </p>
        </div>
    )
}