import { useQuery } from '@tanstack/react-query'
import BrowsePage from 'component/browseReviews/BrowsePage'
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { SpotifyPlaybackSdk, useSetAccessToken, useSetTokenFunction } from 'component/playbackSDK/PlaybackSDK'
import { UserPreferencesModal } from 'component/preferences/UserPreferencesForm'
import { NotFound } from 'pages/NotFound'
import { StrictMode, useCallback, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeValue } from 'state/UserPreferences'
import { AppConfig } from 'util/AppConfig'
import './index.css'


export default function App() {
    const theme = useThemeValue()
    useSyncAccessToken()

    return (
        <div data-theme={theme} className="h-screen bg-base-300">
            <div className="h-screen">
                <SpotifyPlaybackSdk />
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

const useSyncAccessToken = () => {
    /**
     * Setup Playback SDK.
     */
    const setTokenFunction = useSetTokenFunction()
    const accessTokenRef = useRef<string | null>(null)

    const { data } = useQuery(['SpotifyAccessToken'], async () => {
        const r = await fetch(AppConfig.httpAccessTokenEndpoint, { method: 'GET', credentials: 'include' })
        return await r.text()
    }, {
        // 55 minutes just to be safe.
        refetchInterval: 55 * 60 * 1000,
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

    useEffect(() => {
        setTokenFunction({ getOAuthToken: accessTokenFunc })
    }, [])

    /**
     * Setup Spotify API.
     */
    const setAccessToken = useSetAccessToken()

    useEffect(() => {
        if (data) {
            setAccessToken(data)
        }
    }, [data])

}
