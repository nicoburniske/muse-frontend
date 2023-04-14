import { Dialog } from '@headlessui/react'
import { ThemeModal } from 'platform/component/ThemeModal'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { transferPlaybackOnMountAtom } from 'state/UserPreferences'
import { SeekIntervalSetter } from './SeekIntervalSetter'
import { ThemeSetter } from './ThemeSetter'
import { TogglePreferences } from './TogglePreferences'
import Portal from 'platform/component/Portal'
import { useQueryClient } from '@tanstack/react-query'
import { CogIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { clearPersister } from 'MuseQueryClientProvider'

const modalOpenAtom = atom(false)

export const usePreferencesModal = () => {
   const setModalOpen = useSetAtom(modalOpenAtom)

   return {
      openPreferencesModal: () => setModalOpen(true),
      closePreferencesModal: () => setModalOpen(false),
   }
}

export const UserPreferencesButton = () => {
   const { openPreferencesModal } = usePreferencesModal()

   return (
      <button className='btn btn-ghost' onClick={openPreferencesModal}>
         <CogIcon />
      </button>
   )
}

export const UserPreferencesModal = () => {
   const { closePreferencesModal } = usePreferencesModal()
   const isModalOpen = useAtomValue(modalOpenAtom)

   return (
      <Portal>
         <ThemeModal open={isModalOpen} className='max-w-xl text-base-content' onClose={closePreferencesModal}>
            <UserPreferencesForm />
         </ThemeModal>
      </Portal>
   )
}

export const UserPreferencesForm = () => {
   const setModalOpen = useSetAtom(modalOpenAtom)
   const queryClient = useQueryClient()

   return (
      <div className='relative flex flex-col items-center justify-between py-5'>
         <Dialog.Title className='text-xl font-bold'>Preferences</Dialog.Title>
         <div className='flex w-4/5 flex-col space-y-5 p-3'>
            <ThemeSetter />
            <TogglePreferences atom={transferPlaybackOnMountAtom} />
            <SeekIntervalSetter />
            <button
               className='btn btn-primary btn-md m-auto'
               onClick={() => {
                  clearPersister()
                  queryClient.clear()
               }}
            >
               Clear Cache
            </button>
            <a
               className='btn btn-error btn-md m-auto'
               rel='noreferrer'
               target='_blank'
               href={'https://www.spotify.com/us/account/apps/'}
            >
               Revoke Spotify Access
            </a>
         </div>
         <button className='btn btn-square btn-error btn-sm absolute top-5 right-5' onClick={() => setModalOpen(false)}>
            <XMarkIcon className='h-6 w-6' />
         </button>
      </div>
   )
}
