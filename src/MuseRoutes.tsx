import './index.css'
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { NotFound } from 'pages/NotFound'
import { Routes, Route } from 'react-router-dom'
import { NavPlayerPageOutlet } from 'component/nav/NavPlayerPage'
import ReviewsPage from 'component/myReviews/ReviewsPage'
import AboutPage from 'pages/AboutPage'

export default function MuseRoutes() {
    return (
        <Routes>
            <Route path="/app" element={<NavPlayerPageOutlet />}>
                <Route index element={<ReviewsPage />} />
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="reviews/:reviewId" element={<DetailedReviewPage />} />
                <Route path="*" element={<NotFound label="Back" redirect="/app" />} />
            </Route>
            <Route path="/" element={<AboutPage />} />
            <Route path="*" element={<NotFound label="Home" redirect="/" />} />
        </Routes>
    )
}