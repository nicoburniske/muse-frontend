import { useAtom, WritableAtom } from 'jotai'

export const TogglePreferences = ({ label, atom }: { label: string, atom: WritableAtom<boolean, boolean> }) => {
    const [shouldTransfer, setShouldTransfer] = useAtom(atom)

    const toggle = () => setShouldTransfer(!shouldTransfer)

    return (
        <div className="form-control w-full">
            <label className="label flex-row cursor-pointer">
                <span className="label-text text-base">{label}</span>
                <input type="checkbox" className="toggle" checked={shouldTransfer} onChange={() => toggle()} />
            </label>
        </div>
    )
}