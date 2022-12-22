import { useQuery } from '@tanstack/react-query'
import BrowsePage from 'component/browseReviews/BrowsePage'
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { SpotifyPlaybackSdk, useSetAccessToken, useSetTokenFunction } from 'component/playbackSDK/PlaybackSDK'
import { UserPreferencesModal } from 'component/preferences/UserPreferencesForm'
import { useExecuteOnce } from 'hook/useExecuteOnce'
import { NotFound } from 'pages/NotFound'
import { StrictMode, useCallback, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeValue } from 'state/UserPreferences'
import { AppConfig } from 'util/AppConfig'
import { nonNullable } from 'util/Utils'
import './index.css'


export default function App() {
    const theme = useThemeValue()

    return (
        <div data-theme={theme} className="h-screen bg-base-300">
            <div className="h-screen">
                {/* Effects lower in component tree to avoid re-render */}
                <SyncAccessToken />
                <SpotifyPlaybackSdk />
                {/* Routes */}
                <StrictMode>
                    <Routes>
                        <Route path="/" element={<BrowsePage />} />
                        <Route path="/reviews" element={<BrowsePage />} />
                        <Route path="reviews/:reviewId" element={<DetailedReviewPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <UserPreferencesModal />
                </StrictMode>
            </div>
        </div>
    )
}

// 55 minutes just to be safe.
const accessTokenInterval = 55 * 60 * 1000

const SyncAccessToken = () => {
    /**
     * Setup Playback SDK.
     */
    const setTokenFunction = useSetTokenFunction()
    const accessTokenRef = useRef<string | null>(null)

    const { data } = useQuery(['SpotifyAccessToken'], async () => {
        const r = await fetch(AppConfig.httpAccessTokenEndpoint, { method: 'GET', credentials: 'include' })
        return await r.text()
    }, {
        refetchInterval: accessTokenInterval,
        staleTime: accessTokenInterval,
        cacheTime: accessTokenInterval,
        refetchIntervalInBackground: true,
    })

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

