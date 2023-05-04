import DetailedReviewPage from 'pages/detailedReview/DetailedReviewPage'
import { NotFound } from 'pages/NotFound'
import { Routes, Route } from 'react-router-dom'
import { NavPlayerPageOutlet } from 'component/container/NavPlayerPage'
import ReviewsPage from 'pages/myReviews/ReviewsPage'
import AboutPage from 'pages/AboutPage'
import SearchPage from 'pages/searchSpotify/SearchPage'
import { MyPlaylistsPage } from 'pages/MyPlaylists'
import { ProfilePage } from 'pages/profile/ProfilePage'
import { PlaylistPage } from 'pages/PlaylistPage'

export default function MuseRoutes() {
   return (
      <Routes>
         <Route path='/app' element={<NavPlayerPageOutlet />}>
            <Route index element={<ReviewsPage />} />
            <Route path='search' element={<SearchPage />} />
            <Route path='reviews' element={<ReviewsPage />} />
            <Route path='playlists' element={<MyPlaylistsPage />} />
            <Route path='playlist/:playlistId' element={<PlaylistPage />} />
            <Route path='reviews/:reviewId' element={<DetailedReviewPage />} />
            <Route path='user/:userId' element={<ProfilePage />} />
            <Route path='*' element={<NotFound label='Back' redirect='/app' />} />
         </Route>
         <Route path='/' element={<AboutPage />} />
         <Route path='*' element={<NotFound label='Home' redirect='/' />} />
      </Routes>
   )
}

/* <ScrollRestoration
   getKey={location => {
      const paths = ['/app/reviews', '/app/playlists', '/app/user']
      if (paths.some(path => location.pathname === path)) {
         return location.pathname
      } else {
         return location.key
      }
   }}
/> */
