import { useCallback, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { AppConfig } from 'util/AppConfig'
import { useThemeValue } from 'state/UserPreferences'
import { CurrentUserQuery, useCurrentUserQuery } from 'graphql/generated/schema'
import { Link } from 'react-router-dom'
import { cn } from 'util/Utils'
import { useSpotifyLogo } from 'component/ListenOnSpotify'

type NavigationItem = {
   name: string
   href: string
}

const navigation: NavigationItem[] = []

const useCurrentUsername = () => {
   const { data } = useCurrentUserQuery(
      {},
      {
         staleTime: 10 * 60 * 1000,
         cacheTime: 10 * 60 * 1000,
         select: useCallback((data: CurrentUserQuery) => data?.user?.spotifyProfile?.displayName ?? data?.user?.id, []),
         retry: false,
      }
   )
   return data
}

export default function AboutPage() {
   const theme = useThemeValue()
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
   const isLoggedIn = useCurrentUsername() !== undefined
   const spotifyLogo = useSpotifyLogo()

   return (
      <div className='isolate h-screen bg-base-100 text-base-content' data-theme={theme}>
         <div className='px-6 pt-6 lg:px-8'>
            <nav className='flex items-center justify-between' aria-label='Global'>
               <div className='flex lg:flex-1'>
                  <a href='#' className='-m-1.5 p-1.5'>
                     <span className='sr-only'>Muse</span>
                     <img className='h-8' src='/logo.png' alt='' />
                  </a>
               </div>
               <div className='flex lg:hidden'>
                  <button
                     type='button'
                     className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5'
                     onClick={() => setMobileMenuOpen(true)}
                  >
                     <span className='sr-only'>Open main menu</span>
                     <Bars3Icon className='h-6 w-6' aria-hidden='true' />
                  </button>
               </div>
               <div className='hidden lg:flex lg:gap-x-12'>
                  {navigation.map(item => (
                     <a key={item.name} href={item.href} className='text-sm font-semibold leading-6'>
                        {item.name}
                     </a>
                  ))}
               </div>
               <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
                  {isLoggedIn ? (
                     <Link to='/app' className='btn btn-primary'>
                        Enter App
                     </Link>
                  ) : (
                     <a href={AppConfig.loginRedirect} className='text-sm font-semibold leading-6 text-base-content'>
                        Log in with Spotify
                        <span aria-hidden='true'>&rarr;</span>
                     </a>
                  )}
               </div>
            </nav>
            <Dialog as='div' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
               <Dialog.Panel className='fixed inset-0 z-10 overflow-y-auto bg-primary px-6 py-6 text-primary-content lg:hidden'>
                  <div className='flex items-center justify-between'>
                     <a href='#' className='-m-1.5 p-1.5'>
                        <span className='sr-only'>Muse</span>
                        <img className='h-8' src='/logo.png' alt='' />
                     </a>
                     <button type='button' className='-m-2.5 rounded-md p-2.5' onClick={() => setMobileMenuOpen(false)}>
                        <span className='sr-only'>Close menu</span>
                        <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                     </button>
                  </div>
                  <div className='mt-6 flow-root'>
                     <div className='-my-6 divide-y divide-primary-content/50'>
                        <div className='space-y-2 py-6'>
                           {navigation.map(item => (
                              <a
                                 key={item.name}
                                 href={item.href}
                                 className='-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 hover:bg-primary-focus'
                              >
                                 {item.name}
                              </a>
                           ))}
                        </div>
                        <div className='py-6'>
                           {isLoggedIn ? (
                              <Link to='/app' className='btn btn-primary'>
                                 Enter App
                              </Link>
                           ) : (
                              <a
                                 href={AppConfig.loginRedirect}
                                 className='-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-6 hover:bg-primary-focus'
                              >
                                 Log in with Spotify
                              </a>
                           )}
                        </div>
                     </div>
                  </div>
               </Dialog.Panel>
            </Dialog>
         </div>
         <main>
            <div className='relative px-6 lg:px-8'>
               <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56'>
                  <div className='flex flex-col items-center text-center'>
                     <h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>Muse</h1>
                     <p className='mt-6 leading-8 sm:text-lg'>A free and open-source music review platform</p>
                     <div className='mt-4 flex items-center justify-center space-x-6'>
                        <a
                           href='#'
                           className='rounded-md bg-primary px-3.5 py-1.5 text-base font-semibold leading-7 text-primary-content shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:bg-primary-focus'
                        >
                           Get started
                        </a>
                        <a href='#' className='text-base font-semibold leading-7'>
                           Learn more <span aria-hidden='true'>→</span>
                        </a>
                     </div>

                     <p className='mt-20 inline-flex items-center leading-8 sm:text-lg'>
                        Powered by
                        <a
                           className={cn('inline-block px-3 lg:px-5')}
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
