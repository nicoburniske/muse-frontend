import { SideNavBar } from './SideNavBar'
import { StrictMode, useCallback, useEffect, useRef } from 'react'
import { SpotifyPlayerWrapper } from 'component/detailedReview/playback/SpotifyPlayerWrapper'
import { MobileMenu } from './MobileMenu'
import Portal from 'component/Portal'
import { SpotifyPlaybackSdk, useSetTokenFunction } from 'component/sdk/PlaybackSDK'
import useAccessTokenQuery from 'state/useAccessTokenQuery'
import { useExecuteOnce } from 'hook/useExecuteOnce'
import { nonNullable } from 'util/Utils'
import { Outlet } from 'react-router-dom'
import { UserPreferencesModal } from 'component/preferences/UserPreferencesForm'
import { useThemeValue } from 'state/UserPreferences'
import { useSetAccessToken } from 'component/sdk/ClientAtoms'


export const NavPlayerPageOutlet = () => {
    return (
        <NavPlayerPage>
            <Outlet />
        </NavPlayerPage>
    )
}

// Add navbar and player to the page.
const NavPlayerPage = ({ children }: { children: React.ReactNode }) => {
    const theme = useThemeValue()
    return (
        <div className="flex h-screen flex-col bg-base-100" data-theme={theme}>
            {/* Effects lower in component tree to avoid re-render */}
            <SyncAccessToken />
            <SpotifyPlaybackSdk />
            <div className="flex grow flex-row overflow-hidden" >
                <SideNavBar />
                <StrictMode>
                    {children}
                </StrictMode>
            </div>
            <div className='w-full' >
                <SpotifyPlayerWrapper />
            </div>
            <Portal>
                <MobileMenu />
            </Portal>
            <Portal>
                <UserPreferencesModal />
            </Portal>
        </div >
    )
}


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

    const accessTokenFunc: Spotify.PlayerInit['getOAuthToken'] = useCallback(
        (callback) => {
            const accessToken = accessTokenRef.current
            if (accessToken) {
                callback(accessToken)
            }
        },
        [],
    )

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