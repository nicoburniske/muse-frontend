import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppConfig } from 'util/AppConfig'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDisconnectPlayer } from 'component/sdk/PlaybackSDK'

export default function useLogoutMutation(options?: UseMutationOptions<unknown, unknown, undefined, unknown>) {
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
