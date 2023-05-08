import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { StylesObj, TourProvider } from '@reactour/tour'
import { StrictMode, Suspense, useCallback, useEffect, useRef } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet } from 'react-router-dom'

import { CommandMenu } from '@/component/Command'
import { DeleteReviewModal } from '@/component/deleteReview/DeleteReviewModal'
import { EditReviewModal } from '@/component/editReview/EditReview'
import { SpotifyPlayerWrapper } from '@/component/player/SpotifyPlayerWrapper'
import { UserPreferencesModal } from '@/component/preferences/UserPreferencesForm'
import { SubscribeReviews } from '@/component/reviewUpdates/SubscribeReviews'
import { useSetAccessToken } from '@/component/sdk/ClientAtoms'
import { useSetTokenFunction } from '@/component/sdk/PlaybackSDK'
import { SelectedReviewModal } from '@/component/SelectedReview'
import { ShareReviewModal } from '@/component/shareReview/ShareReview'
import { Alert, AlertDescription, AlertTitle } from '@/lib/component/Alert'
import Hero from '@/lib/component/Hero'
import { HeroLoading } from '@/lib/component/HeroLoading'
import { SyncCurrentUser } from '@/state/CurrentUser'
import useAccessTokenQuery from '@/state/useAccessTokenQuery'
import { useThemeValue } from '@/state/UserPreferences'

import { SideNavBar } from './SideNavBar'

export const NavPlayerPageOutlet = () => {
   return (
      <NavPlayerPage>
         <Outlet />
      </NavPlayerPage>
   )
}

// Add navbar and player to the page.
const NavPlayerPage = ({ children }: { children: React.ReactNode }) => {
   return (
      <TourProvider
         // @ts-ignore
         Wrapper={ThemeWrapper}
         styles={onboardingStyles}
      >
         <div className='flex h-screen flex-col bg-background'>
            {/* Effects lower in component tree to avoid re-render */}
            <SyncAccessToken />
            <SyncCurrentUser />
            <div className='flex flex-1 flex-row overflow-hidden'>
               <SideNavBar />
               <ErrorBoundary
                  fallback={
                     <Hero>
                        <div className='h-10 w-full'>
                           <Alert variant='destructive'>
                              <ExclamationTriangleIcon className='h-4 w-4' />
                              <AlertTitle>Something went wrong.</AlertTitle>
                              <AlertDescription> Refresh the page! </AlertDescription>
                           </Alert>
                        </div>
                     </Hero>
                  }
               >
                  <Suspense fallback={<HeroLoading />}>
                     <SubscribeReviews />
                     <CommandMenu />
                     <StrictMode>{children}</StrictMode>
                  </Suspense>
               </ErrorBoundary>
            </div>
            <div className='muse-player hidden w-full sm:inline'>
               <SpotifyPlayerWrapper />
            </div>
            {/* TODO: inject user id? */}
            <SelectedReviewModal />
            <ShareReviewModal />
            <EditReviewModal />
            <DeleteReviewModal />
            <UserPreferencesModal />
         </div>
      </TourProvider>
   )
}

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
   const theme = useThemeValue()
   return <div data-theme={theme}>{children}</div>
}

const onboardingStyles = {
   badge: base => ({ ...base, background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }),
   controls: base => ({ ...base, color: 'hsl(var(--primary))' }),
   navigation: base => ({ ...base, color: 'hsl(var(--primary))' }),
   // @ts-ignore. These type definitions are horrendous.
   dot: (base, { current }) => ({
      ...base,
      color: 'hsl(var(--p))',
      background: current ? 'hsl(var(--primary))' : 'hsl(var(--background))',
   }),
   arrow: base => ({ ...base, color: 'hsl(var(--foreground))' }),
   // @ts-ignore.
   popover: base => ({
      ...base,
      color: 'hsl(var(--foreground))',
      backgroundColor: 'hsl(var(--background))',
   }),
} as StylesObj

const SyncAccessToken = () => {
   /**
    * Setup Playback SDK.
    */
   const accessTokenRef = useRef<string | null>(null)

   const { data } = useAccessTokenQuery()

   useEffect(() => {
      if (data) {
         accessTokenRef.current = data
      }
   }, [accessTokenRef, data])

   const accessTokenFunc: Spotify.PlayerInit['getOAuthToken'] = useCallback(
      callback => {
         const accessToken = accessTokenRef.current
         if (accessToken) {
            callback(accessToken)
         }
      },
      [accessTokenRef]
   )

   /**
    * Set Token callback for Playback SDK.
    */
   const setTokenFunction = useSetTokenFunction()

   useEffect(() => {
      if (data) {
         setTokenFunction({ getOAuthToken: accessTokenFunc })
      }
   }, [data])

   /**
    * Setup Spotify API.
    */
   const setAccessToken = useSetAccessToken()

   useEffect(() => {
      if (data) {
         setAccessToken(data)
      }
   }, [data])

   return null
}
