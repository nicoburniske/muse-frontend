import { useState } from 'react'
import UserProfile from 'component/UserProfile'
import CreateReview from 'component/CreateReview'


export default function App() {
  return (
    <div>
      <CreateReview />
      <UserProfile />
    </div>
  )
}

