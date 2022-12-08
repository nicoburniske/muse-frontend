import { useQuery } from '@tanstack/react-query'
import BrowsePage from 'component/browseReviews/BrowsePage'
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { SpotifyPlaybackSdk, useSetAccessToken } from 'component/playbackSDK/PlaybackSDK'
import { useAtomValue } from 'jotai'
import { StrictMode, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { themeAtom } from 'state/Atoms'
import { AppConfig } from 'util/AppConfig'
import './index.css'


export default function App() {
    const theme = useAtomValue(themeAtom)
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
                    </Routes>
                </StrictMode>
            </div>
        </div>
    )
}

const useSyncAccessToken = () => {
    const setAccessToken = useSetAccessToken()

    const { data } = useQuery(['spotify-access-token'], async () => {
        const r = await fetch(AppConfig.httpAccessTokenEndpoint, { method: 'GET', credentials: 'include' })
        return await r.text()
    }, {
        staleTime: 60 * 45 * 1000,
        refetchIntervalInBackground: true
    }
    )
    useEffect(() => {
        if (data) {
            setAccessToken(data)
        }
    }, [data])

}
