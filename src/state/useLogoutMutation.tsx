import { UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppConfig } from 'util/AppConfig'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function useLogoutMutation(options?: UseMutationOptions<unknown, unknown, undefined, unknown>) {
    const nav = useNavigate()
    const queryClient = useQueryClient()

    return useMutation(['Logout'], () => axios.post(AppConfig.logoutEndpoint, null, { withCredentials: true }), {
        onSettled: () => {
            queryClient.clear()
            nav('/')
        },
        ...options,
    }
    )
}