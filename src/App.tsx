import { useState } from 'react'
import { useQuery } from 'react-query'
import wretch from 'wretch'

import './App.css'

interface ReviewSummary {
  id: String,
  createdAt: Date,
  creatorId: String,
  reviewName: String,
  isPublic: Boolean,
  // Spotify entity data.
  entityType: EntityType,
  entityId: String,
  entityName: String,
  imageUrl: [String]
}

enum EntityType {
  Album = 0,
  Artist = 1,
  Playlist = 2,
  Track = 3,
}

const loadAllUserReviews = () =>
  useQuery<ReviewSummary[]>('allUserReviews', () =>
    wretch('http://localhost:8883/user/reviews')
      .options({ credentials: "include" })
      .get().json()
    , { refetchOnMount: true })


interface SpotifyUser {
  displayName?: String,
  externalUrls: Map<String, String>,
  href: String,
  id: String,
  type: String,
  uri: String
}

const getUserInfo = () =>
  // TODO: Create Interface
  useQuery('userInfo', () =>
    wretch('http://localhost:8883/user/me')
      .options({ credentials: "include" })
      .get().json()
    , { refetchOnMount: true })

const getDetailedReview = (id: String) =>
  useQuery('detailedReview' + id, () =>
    wretch(`http://localhost:8883/user/review/${id}`)
      .options({ credentials: "include" })
      .get().json()
    , { refetchOnMount: true })

interface ReviewProps {
  id: String
}
function Review({ id }: ReviewProps) {
  const { isLoading, error, data: review, refetch } = getDetailedReview(id);
  if (review) {
    return (<div>
      <span> {review?.review.id} </span>
      <span> {review?.review.reviewName} </span>
      <span> {review?.entity.name} </span>
      <span> {review?.entity.imageUrl} </span>
    </div>)
  }
}

export default function App() {

  const [count, setCount] = useState(0)
  // const { isLoading, error, data: reviews, refetch } = loadAllUserReviews()

  // if (isLoading) {
  //   return "Loading"
  // }
  // if (error) {
  //   return "Error when loading"
  // }
  // else if (reviews) {
  //   const visual = reviews.map(r =>{
  //     console.log(r);
  //     return <Review key={r.id} id={r.id} />
  // })

  // {/* <button type="button" onClick={() => refetch()}> Refresh Reviews </button> */} {/* <div>
  //   {visual}
  // </div> */}

  const incrementCount = () => setCount((count) => count + 1)
  return (
    <div className="App">
      <p>Hello Vite + React!</p>
      <p>
        <button type="button" onClick={incrementCount}>
          count is: {count}
        </button>
      </p>
      <p> </p>
    </div>
  )
}

