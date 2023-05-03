import { useCallback } from 'react'
import { AppConfig } from 'util/AppConfig'
import { CurrentUserQuery, useCurrentUserQuery } from 'graphql/generated/schema'
import { Link } from 'react-router-dom'
import { cn } from 'util/Utils'
import { useSpotifyLogo } from 'component/ListenOnSpotify'
import { Button } from 'platform/component/Button'

type NavigationItem = {
   name: string
   href: string
}

const navigation: NavigationItem[] = []

const useCurrentUsername = () => {
   const { data } = useCurrentUserQuery(
      {},
      {
         staleTime: 60 * 1000,
         cacheTime: 60 * 1000,
         select: useCallback((data: CurrentUserQuery) => data?.user?.spotifyProfile?.displayName ?? data?.user?.id, []),
      }
   )
   return data
}

export default function AboutPage() {
   const isLoggedIn = useCurrentUsername() !== undefined
   const spotifyLogo = useSpotifyLogo()

   return (
      <div className='isolate h-screen bg-background text-foreground'>
         <div className='px-6 pt-6 lg:px-8'>
            <nav className='flex items-center justify-between' aria-label='Global'>
               <div className='flex lg:flex-1'>
                  <a href='#' className='-m-1.5 p-1.5'>
                     <span className='sr-only'>Muse</span>
                     <img className='h-8' src='/logo.png' alt='' />
                  </a>
               </div>
               <div className='flex flex-1 justify-end'>
                  {isLoggedIn ? (
                     <Link to='/app'>
                        <Button>Enter App</Button>
                     </Link>
                  ) : (
                     <a href={AppConfig.loginRedirect}>
                        <Button>Log in with Spotify</Button>
                     </a>
                  )}
               </div>
            </nav>
         </div>
         <main>
            <div className='relative px-6 lg:px-8'>
               <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56'>
                  <div className='flex flex-col items-center text-center'>
                     <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>Muse</h1>
                     <p className='mt-6 leading-8 sm:text-lg'>An open-source music review platform</p>
                     <div className='mt-4 flex items-center justify-center space-x-6'>
                        <a href='#'>
                           <Button variant='outline'>Get started</Button>
                        </a>
                        <a href='#'>
                           <Button>
                              Learn more <span aria-hidden='true'>→</span>
                           </Button>
                        </a>
                     </div>

                     <p className='mt-20 inline-flex items-center leading-8 sm:text-lg'>
                        Powered by
                        <a
                           className={cn('inline-block pl-3 lg:pl-5')}
                           href={'https://www.spotify.com/'}
                           rel='noreferrer'
                           target='_blank'
                        >
                           <img src={spotifyLogo} className='w-20 lg:w-28' />
                        </a>
                     </p>
                  </div>
               </div>
            </div>
         </main>
      </div>
   )
}
