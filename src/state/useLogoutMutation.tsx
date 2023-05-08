import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { useDisconnectPlayer } from '@/component/sdk/PlaybackSDK'
import { AppConfig } from '@/util/AppConfig'

export function useLogoutMutation(options?: UseMutationOptions<unknown, unknown, undefined, unknown>) {
   const nav = useNavigate()
   const queryClient = useQueryClient()
   const disconnectPlayer = useDisconnectPlayer()

   return useMutation(['Logout'], () => axios.post(AppConfig.logoutEndpoint, null, { withCredentials: true }), {
      onSettled: () => {
         queryClient.clear()
         disconnectPlayer()
         nav('/')
      },
      ...options,
   })
}
