import { ArrowRightOnRectangleIcon, CogIcon, UserIcon } from '@heroicons/react/24/outline'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useNavigate } from 'react-router-dom'

import { usePreferencesModal } from '@/component/preferences/UserPreferencesForm'
import { UserAvatar } from '@/component/UserAvatar'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/lib/component/DropdownMenu'
import { useCurrentUserDisplayName, useCurrentUserId, useCurrentUserImage } from '@/state/CurrentUser'
import useLogoutMutation from '@/state/useLogoutMutation'

type ProfileDropdownProps = {
   onModalOpen?: () => void
}
export const ProfileDropdownSuspense = ({ onModalOpen }: ProfileDropdownProps) => {
   return (
      <ErrorBoundary fallback={<ProfilePlaceholder />}>
         <Suspense fallback={<ProfilePlaceholder />}>
            <ProfileDropdown onModalOpen={onModalOpen} />
         </Suspense>
      </ErrorBoundary>
   )
}

export const ProfileDropdown = ({ onModalOpen = () => {} }: ProfileDropdownProps) => {
   const { openPreferencesModal } = usePreferencesModal()
   const { mutate: logout } = useLogoutMutation()

   const id = useCurrentUserId()
   const displayName = useCurrentUserDisplayName()
   const image = useCurrentUserImage()

   const [open, setOpen] = useState(false)

   const openPreferences = () => {
      onModalOpen()
      openPreferencesModal()
      setOpen(false)
   }
   const nav = useNavigate()
   const profileLink = () => nav(`/app/user/${id}`)

   return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
         <DropdownMenuTrigger>
            <UserAvatar
               name={displayName}
               className={'h-10 w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-background'}
               image={image}
            />
         </DropdownMenuTrigger>
         <DropdownMenuContent className='w-42'>
            <DropdownMenuItem onClick={profileLink}>
               <UserIcon className='mr-2 h-4 w-4' />
               <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={openPreferences}>
               <CogIcon className='mr-2 h-4 w-4' />
               <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout(undefined)}>
               <ArrowRightOnRectangleIcon className='mr-2 h-4 w-4' />
               <span>Log out</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <div className='px-2 py-1.5'>
               <p className='text-sm'>{displayName}</p>
               <p className='truncate text-sm font-medium'>@{id}</p>
            </div>
         </DropdownMenuContent>
      </DropdownMenu>
   )
}
{
   /* <div className='px-4 py-3'>
<p className='text-sm'>{displayName}</p>
<p className='truncate text-sm font-medium'>@{id}</p>
</div> */
}

export const ProfilePlaceholder = () => {
   return (
      <div className='flex w-full justify-center'>
         <div className='avatar placeholder'>
            <div className='bg-neutral-focus text-neutral-content w-10 rounded-full'>
               <span className='text-xl'>?</span>
            </div>
         </div>
      </div>
   )
}
