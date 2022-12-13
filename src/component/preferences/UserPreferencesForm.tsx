import { Dialog } from '@headlessui/react'
import { CrossIcon, SettingsIcon } from 'component/Icons'
import { ThemeModal } from 'component/ThemeModal'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import ReactDOM from 'react-dom'
import { transferPlaybackOnMountAtom } from 'state/UserPreferences'
import { SeekIntervalSetter } from './SeekIntervalSetter'
import { ThemeSetter } from './ThemeSetter'
import { TogglePreferences } from './TogglePreferences'

const modalOpenAtom = atom(false)

export const usePreferencesModal = () => {
    const setModalOpen = useSetAtom(modalOpenAtom)

    return {
        openPreferencesModal: () => setModalOpen(true),
        closePreferencesModal: () => setModalOpen(false)
    }
}

export const UserPreferencesButton = () => {
    const { openPreferencesModal } = usePreferencesModal()

    return (
        <button className='btn btn-ghost' onClick={openPreferencesModal}>
            <SettingsIcon />
        </button>
    )
}

export const UserPreferencesModal = () => {
    const isModalOpen = useAtomValue(modalOpenAtom)

    return (
        ReactDOM.createPortal(
            <ThemeModal open={isModalOpen} className="max-w-xl text-base-content">
                <UserPreferencesForm />
            </ThemeModal>,
            document.body
        )
    )
}

export const UserPreferencesForm = () => {
    const setModalOpen = useSetAtom(modalOpenAtom)

    return (
        <div className="flex flex-col items-center justify-between space-y-5 p-2 relative">
            <Dialog.Title className="font-bold text-xl">
                preferences
            </Dialog.Title>
            <div className="flex flex-col space-y-2 w-3/4">
                <div className="flex flex-row items-center justify-between w-full">
                    <label className="label">
                        <span className="label-text text-base"> app theme </span>
                    </label>
                    <ThemeSetter />
                </div>
                <TogglePreferences label={'transfer playback on start'} atom={transferPlaybackOnMountAtom} />
                <SeekIntervalSetter />
            </div>
            <button className='btn btn-sm btn-error absolute top-0 right-5' onClick={() => setModalOpen(false)}>
                <CrossIcon />
            </button>
        </div>
    )
}
