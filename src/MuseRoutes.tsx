import { Route, Routes } from 'react-router-dom'

import { NavPlayerPageOutlet } from '@/component/container/NavPlayerPage'
import AboutPage from '@/pages/AboutPage'
import DetailedReviewPage from '@/pages/detailedReview/DetailedReviewPage'
import { MyPlaylistsPage } from '@/pages/MyPlaylists'
import ReviewsPage from '@/pages/myReviews/ReviewsPage'
import { NotFound } from '@/pages/NotFound'
import { PlaylistPage } from '@/pages/PlaylistPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import SearchPage from '@/pages/searchSpotify/SearchPage'

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
