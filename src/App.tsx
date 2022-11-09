import BrowsePage from 'component/browseReviews/BrowsePage'
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { useAtomValue } from 'jotai'
import { Routes, Route } from 'react-router-dom'
import { themeAtom } from 'state/Atoms'
import './index.css'


export default function App() {
    const theme = useAtomValue(themeAtom)

    return (
        <div data-theme={theme} className="h-screen bg-base-300">
            <div className="h-screen">
                <Routes>
                    <Route path="/" element={<BrowsePage />} />
                    <Route path="/reviews" element={<BrowsePage />} />
                    <Route path="reviews/:reviewId" element={<DetailedReviewPage />} />
                </Routes>
            </div>
        </div>
    )
}

