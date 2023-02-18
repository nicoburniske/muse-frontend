import { SideNavBar } from './SideNavBar'
import { StrictMode, Suspense, useCallback, useEffect, useRef } from 'react'
import { SpotifyPlayerWrapper } from 'component/detailedReview/playback/SpotifyPlayerWrapper'
import { MobileMenu } from './MobileMenu'
import Portal from 'platform/component/Portal'
import { useSetTokenFunction } from 'component/sdk/PlaybackSDK'
import useAccessTokenQuery from 'state/useAccessTokenQuery'
import { useExecuteOnce } from 'platform/hook/useExecuteOnce'
import { nonNullable } from 'util/Utils'
import { Outlet } from 'react-router-dom'
import { UserPreferencesModal } from 'component/preferences/UserPreferencesForm'
import { useThemeValue } from 'state/UserPreferences'
import { useSetAccessToken } from 'component/sdk/ClientAtoms'
import { SyncCurrentUser } from 'state/CurrentUser'
import { HeroLoading } from 'platform/component/HeroLoading'
import { ErrorBoundary } from 'react-error-boundary'
import Hero from 'platform/component/Hero'
import { Alert, AlertSeverity } from 'platform/component/Alert'
import { StylesObj, TourProvider } from '@reactour/tour'

export const NavPlayerPageOutlet = () => {
   const theme = useThemeValue()
   return (
      <NavPlayerPage data-theme={theme}>
         <Outlet />
      </NavPlayerPage>
   )
}

// Add navbar and player to the page.
const NavPlayerPage = ({ children }: { children: React.ReactNode }) => {
   const theme = useThemeValue()
   return (
      <TourProvider
         data-theme={theme}
         // @ts-ignore
         Wrapper={ThemeWrapper}
         styles={onboardingStyles}
      >
         <div className='flex h-screen flex-col bg-base-100' data-theme={theme}>
            {/* Effects lower in component tree to avoid re-render */}
            <SyncAccessToken />
            <SyncCurrentUser />
            <div className='flex flex-1 flex-row overflow-hidden'>
               <SideNavBar />
               <ErrorBoundary
                  fallback={
                     <Hero>
                        <div className='h-10 w-full'>
                           <Alert severity={AlertSeverity.Error}>
                              <span> Something went wrong. </span>
                           </Alert>
                        </div>
                     </Hero>
                  }
               >
                  <Suspense fallback={<HeroLoading />}>
                     <StrictMode>{children}</StrictMode>
                  </Suspense>
               </ErrorBoundary>
            </div>
            <div className='muse-player hidden w-full sm:inline'>
               <SpotifyPlayerWrapper />
            </div>
            <Portal>
               <MobileMenu />
            </Portal>
            <Portal>
               <UserPreferencesModal />
            </Portal>
         </div>
      </TourProvider>
   )
}

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
   const theme = useThemeValue()
   return <div data-theme={theme}>{children}</div>
}

const onboardingStyles = {
   badge: base => ({ ...base, background: 'hsl(var(--p))', color: 'hsl(var(--pc))' }),
   controls: base => ({ ...base, color: 'hsl(var(--p))' }),
   navigation: base => ({ ...base, color: 'hsl(var(--p))' }),
   // @ts-ignore. These type definitions are horrendous.
   dot: (base, { current }) => ({
      ...base,
      color: 'hsl(var(--p))',
      background: current ? 'hsl(var(--p))' : 'hsl(var(--b1))',
   }),
   arrow: base => ({ ...base, color: 'hsl(var(--bc))' }),
   // @ts-ignore.
   popover: base => ({
      ...base,
      color: 'hsl(var(--bc))',
      backgroundColor: 'hsl(var(--b1))',
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
   }, [data])

   const accessTokenFunc: Spotify.PlayerInit['getOAuthToken'] = useCallback(callback => {
      const accessToken = accessTokenRef.current
      if (accessToken) {
         callback(accessToken)
      }
   }, [])

   /**
    * Set Token callback for Playback SDK.
    */
   const setTokenFunction = useSetTokenFunction()
   useExecuteOnce(
      () => nonNullable(data),
      () => setTokenFunction({ getOAuthToken: accessTokenFunc }),
      [data]
   )

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
