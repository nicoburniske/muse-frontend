import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useSeekInterval, useSetSeekInterval } from 'state/UserPreferences'
import { z } from 'zod'

const seekIntervalSchema = z.coerce.number().min(1).max(120).transform(seek => seek * 1000)

export const SeekIntervalSetter = () => {
    // seek interval is stored in milliseconds.
    const seekInterval = useSeekInterval()
    const setSeekInterval = useSetSeekInterval()

    const [tempInterval, setTempInterval] = useState<string>((seekInterval / 1000).toString())
    const [errors, setErrors] = useState<string[]>([])

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
            messages.forEach(m => toast.error(m))
            setErrors(messages)
        }
    }, [tempInterval])

    return (
        <div className="flex flex-row justify-between">
            <label className="label">
                <span className="label-text text-base">seek interval (seconds)</span>
            </label>
            <input
                type="text"
                className={`input input-bordered ${errors.length > 0 ? 'input-error' : ''}`}
                value={tempInterval}
                onChange={onChange}
            />
        </div>
    )
}