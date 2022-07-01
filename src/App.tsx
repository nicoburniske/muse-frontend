import BrowsePage from 'component/browseReviews/BrowsePage'
import DetailedReviewPage from 'component/detailedReview/DetailedReviewPage'
import { Routes, Route, Link } from "react-router-dom";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={BrowsePage()}/>
      <Route path="/reviews/:reviewId" element={DetailedReviewPage()}/>
    </Routes>)
}

