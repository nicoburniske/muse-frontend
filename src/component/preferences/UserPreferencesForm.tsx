import { Dialog } from '@headlessui/react'
import { ThemeModal } from 'platform/component/ThemeModal'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { transferPlaybackOnMountAtom } from 'state/UserPreferences'
import { SeekIntervalSetter } from './SeekIntervalSetter'
import { ThemeSetter } from './ThemeSetter'
import { TogglePreferences } from './TogglePreferences'
import Portal from 'platform/component/Portal'
import { useQueryClient } from '@tanstack/react-query'
import { AppConfig } from 'util/AppConfig'
import { CogIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
   const isModalOpen = useAtomValue(modalOpenAtom)

   return (
      <Portal>
         <ThemeModal open={isModalOpen} className='max-w-xl text-base-content'>
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
            {AppConfig.DEV && (
               <button className='btn btn-primary btn-md m-auto' onClick={() => queryClient.clear()}>
                  Clear Cache
               </button>
            )}
         </div>
         <button className='btn btn-error btn-square btn-sm absolute top-5 right-5' onClick={() => setModalOpen(false)}>
            <XMarkIcon className='h-6 w-6' />
         </button>
      </div>
   )
}
