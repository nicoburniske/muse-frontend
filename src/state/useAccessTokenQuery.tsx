import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from 'util/AppConfig'

// 55 minutes just to be safe.
const accessTokenInterval = 55 * 60 * 1000

const getAccessToken = async () => {
   const response = await axios.get(AppConfig.httpAccessTokenEndpoint, { responseType: 'text', withCredentials: true })
   return response.data as string
}

const queryKey = ['SpotifyAccessToken']
const useAccessTokenQuery = () => {
   const nav = useNavigate()
   const queryClient = useQueryClient()
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
            nav('/')
         }
      },
   })
}
useAccessTokenQuery.getKey = () => queryKey

export default useAccessTokenQuery
