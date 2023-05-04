import { useCurrentUser } from 'component/sdk/ClientHooks'
import { usePreferencesModal } from 'component/preferences/UserPreferencesForm'
import useLogoutMutation from 'state/useLogoutMutation'
import { Suspense, useCallback, useState } from 'react'
import { PrivateUser } from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { ErrorBoundary } from 'react-error-boundary'
import { UserAvatar } from 'component/UserAvatar'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuTrigger,
   DropdownMenuItem,
   DropdownMenuSeparator,
} from 'platform/component/DropdownMenu'
import { ArrowRightOnRectangleIcon, CogIcon, UserIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

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

   const { data } = useCurrentUser({
      suspense: true,
      staleTime: 1000 * 60 * 60,
      select: useCallback((data?: PrivateUser) => {
         return {
            image: data?.images.at(0)?.url,
            id: data?.id ?? '',
            displayName: data?.display_name ?? '',
         }
      }, []),
   })

   const { image, id, displayName } = data ?? {}
   const name = displayName ?? id ?? ''

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
               name={name}
               className={'h-10 w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-background'}
               image={image}
            />
         </DropdownMenuTrigger>
         <DropdownMenuContent className='w-48'>
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
