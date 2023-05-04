import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { AppConfig } from 'util/AppConfig'

// 55 minutes just to be safe.
const accessTokenInterval = 55 * 60 * 1000

const getAccessToken = async () => {
   const response = await axios.get(AppConfig.httpAccessTokenEndpoint, { responseType: 'text', withCredentials: true })
   return response.data as string
}

const queryKey = ['SpotifyAccessToken']
const useAccessTokenQuery = () => {
   const queryClient = useQueryClient()
   const login = useLogin()
   return useQuery(queryKey, getAccessToken, {
      refetchInterval: accessTokenInterval,
      staleTime: accessTokenInterval,
      cacheTime: accessTokenInterval,
      refetchIntervalInBackground: true,
      retry: error => {
         const status = axios.isAxiosError(error) ? error.response?.status : undefined
         return status !== undefined && status !== 401
      },
      onError: error => {
         if (axios.isAxiosError(error) && error.response?.status === 401) {
            queryClient.clear()
            login()
         }
      },
   })
}
useAccessTokenQuery.getKey = () => queryKey

const useLogin = () => {
   const location = useLocation()
   return useCallback(() => {
      const win: Window = window
      win.location = `${AppConfig.loginEndpoint}?redirect=${encodeURIComponent(window.location.href)}`
   }, [location])
}

export default useAccessTokenQuery
