import UserProfile from 'component/browseReviews/UserProfile'
import CreateReview from 'component/browseReviews/CreateReview'


export default function BrowsePage() {
  return (
    <div>
      <CreateReview />
      <UserProfile />
    </div>
  )
}