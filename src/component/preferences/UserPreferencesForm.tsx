import { CogIcon } from '@heroicons/react/24/outline'
import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtom, useSetAtom } from 'jotai'
import { clearPersister } from 'MuseQueryClientProvider'
import { useState } from 'react'

import { Button } from '@/lib/component/Button'
import { Dialog, DialogContent, DialogTitle } from '@/lib/component/Dialog'
import { transferPlaybackOnMountAtom } from '@/state/UserPreferences'

import { SeekIntervalSetter } from './SeekIntervalSetter'
import { ThemeSetter } from './ThemeSetter'
import { TogglePreferences } from './TogglePreferences'

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
      <Button variant='ghost' size='empty' onClick={openPreferencesModal}>
         <CogIcon />
      </Button>
   )
}

export const UserPreferencesModal = () => {
   const [open, setModalOpen] = useAtom(modalOpenAtom)
   const queryClient = useQueryClient()
   // This is necessary for edge case where menu is open, and then outside click closes modal.
   const [menuOpen, setMenuOpen] = useState(false)

   return (
      <Dialog
         open={open}
         onOpenChange={open => {
            setModalOpen(open)
            if (!open) {
               setMenuOpen(false)
            }
         }}
      >
         <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <ThemeSetter open={menuOpen} setOpen={setMenuOpen} />
            <TogglePreferences
               atom={transferPlaybackOnMountAtom}
               id={'transfer-playback'}
               label={'Transfer Playback'}
               description={'If enabled, playback will start on page load.'}
            />
            <SeekIntervalSetter />
            <Button
               variant='secondary'
               onClick={() => {
                  clearPersister()
                  queryClient.clear()
               }}
            >
               Clear Cache
            </Button>
            <Button variant='destructive'>
               <a rel='noreferrer' target='_blank' href={'https://www.spotify.com/us/account/apps/'}>
                  Revoke Spotify Access
               </a>
            </Button>
         </DialogContent>
      </Dialog>
   )
}
