import { UserAvatar } from 'component/UserAvatar'
import { BrowseCard } from 'component/myReviews/BrowseCard'
import { SelectedReview, useSelectReview } from 'component/myReviews/SelectedReview'
import { ProfileAndReviewsQuery, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import { NotFound } from 'pages/NotFound'
import { Alert, AlertSeverity } from 'platform/component/Alert'
import Hero from 'platform/component/Hero'
import { HeroLoading } from 'platform/component/HeroLoading'
import { MuseTransition } from 'platform/component/MuseTransition'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useParams } from 'react-router-dom'

export function ProfilePage() {
   const { userId } = useParams()
   if (userId) {
      return (
         <ErrorBoundary
            fallback={
               <Hero>
                  <div className='h-10 w-full'>
                     <Alert severity={AlertSeverity.Error}>
                        <span> Error Loading User Profile</span>
                     </Alert>
                  </div>
               </Hero>
            }
         >
            <div className='flex grow bg-base-100'>
               <Suspense fallback={<HeroLoading />}>
                  <UserProfile userId={userId} />
               </Suspense>
            </div>
         </ErrorBoundary>
      )
   } else {
      return (
         <Alert severity={AlertSeverity.Error}>
            <span> Missing User ID </span>
         </Alert>
      )
   }
}

const UserProfile = ({ userId }: { userId: string }) => {
   const { data } = useProfileAndReviewsQuery({ userId }, { suspense: true })

   if (!data?.user?.spotifyProfile) {
      return <NotFound label='Home' redirect='/app/reviews' />
   } else {
      return <UserProfileCard profile={data} />
   }
}

const UserProfileCard = ({ profile }: { profile: ProfileAndReviewsQuery }) => {
   const userImage = profile.user?.spotifyProfile?.images.at(0) ?? ''
   const displayName = profile.user?.spotifyProfile?.displayName
   const userId = profile.user.id
   const followers = profile.user?.spotifyProfile?.numFollowers

   const reviews = profile.user.reviews ?? []
   const numberOfReviews = reviews.length

   const { setSelectedReview } = useSelectReview()

   return (
      <>
         <div className='muse-scrollbar flex flex-1 flex-col items-center overflow-y-auto px-2 pt-16'>
            <div className='mb-6 mt-16 flex w-full min-w-0 max-w-xl flex-col break-words rounded-lg bg-base-200 text-base-content shadow-2xl'>
               <div className='px-6'>
                  <div className='flex flex-wrap justify-center'>
                     <div className='flex w-full justify-center px-4'>
                        <UserAvatar
                           image={userImage}
                           name={displayName ?? userId}
                           className='-m-16 h-32 w-32 rounded-full border-2 border-primary align-middle text-3xl'
                        />
                     </div>
                     <div className='mt-20 w-full px-4 text-center'>
                        <div className='text-center'>
                           <h3 className='mb-2 text-xl font-semibold leading-normal'>{displayName ?? userId}</h3>
                           <div className='mt-0 mb-2 text-sm font-bold leading-normal'>@{userId}</div>
                        </div>
                        <div className='flex justify-center py-4 pt-8 lg:pt-4'>
                           <div className='mr-4 p-3 text-center'>
                              <span className='block text-xl font-bold uppercase tracking-wide'>{followers}</span>
                              <span className=' text-sm'>Followers</span>
                           </div>
                           <div className='p-3 text-center lg:mr-4'>
                              <span className=' block text-xl font-bold uppercase tracking-wide'>
                                 {numberOfReviews}
                              </span>
                              <span className='text-sm'>Reviews</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <main className='w-full '>
               <section className='mx-auto mt-8 max-w-7xl' aria-labelledby='review-gallery'>
                  <MuseTransition option={'Simple'} duration='duration-300'>
                     <ul
                        role='list'
                        className='grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-8'
                     >
                        {reviews.map(review => (
                           <BrowseCard key={review.id} review={review} onClick={() => setSelectedReview(review.id)} />
                        ))}
                     </ul>
                  </MuseTransition>
               </section>
            </main>
         </div>

         <SelectedReview userId={userId} />
      </>
   )
}
