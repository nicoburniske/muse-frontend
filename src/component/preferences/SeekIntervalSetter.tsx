import { useEffect, useState } from 'react'
import { useSeekInterval, useSetSeekInterval } from 'state/UserPreferences'


export const SeekIntervalSetter = () => {
    // seek interval is stored in milliseconds.
    const seekInterval = useSeekInterval()
    const setSeekInterval = useSetSeekInterval()

    const [tempInterval, setTempInterval] = useState<number | undefined>(seekInterval / 1000)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // replace all non-numeric characters with empty string.
        const newValue = e.target.value.replace(/[^0-9]/g, '')
        if (newValue !== '') {
            const asNum = parseInt(newValue)
            const clamped = Math.min(Math.max(asNum, 1), 120)
            setTempInterval(clamped)
        } else {
            setTempInterval(undefined)
        }
    }

    // Propagate changes to seek interval to the state after 500ms of debounce.
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (tempInterval !== undefined && tempInterval !== seekInterval) {
                setSeekInterval(tempInterval * 1000)
            }
        }, 500)
        return () => clearTimeout(timeout)
    }, [tempInterval])

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text text-base">seek interval (seconds) </span>
            </label>
            <input
                type="text"
                className="input input-bordered w-full"
                value={tempInterval}
                onChange={onChange}
            />
        </div>
    )
}