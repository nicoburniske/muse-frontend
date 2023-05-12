import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { MuseAvatar } from '@/component/avatar/MuseAvatar'
import { Icon } from '@/component/container/NavConstants'
import { useSpotifyLogo } from '@/component/ListenOnSpotify'
import { CurrentUserQuery, useCurrentUserQuery } from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import { AppConfig } from '@/util/AppConfig'
import { cn } from '@/util/Utils'

export default function LandingPage() {
   const isLoggedIn = useCurrentUsername() !== undefined
   const spotifyLogo = useSpotifyLogo()

   return (
      <div className='relative isolate flex h-screen w-full flex-col overflow-y-auto bg-background text-foreground overflow-x-hidden'>
         <svg
            className='absolute inset-0 -z-10 h-full w-full stroke-foreground/10 [mask-image:radial-gradient(100%_100%_at_top_right,hsl(var(--foreground)),transparent)]'
            aria-hidden='true'
         >
            <defs>
               <pattern
                  id='983e3e4c-de6d-4c3f-8d64-b9761d1534cc'
                  width={200}
                  height={200}
                  x='50%'
                  y={-1}
                  patternUnits='userSpaceOnUse'
               >
                  <path d='M.5 200V.5H200' fill='none' />
               </pattern>
            </defs>
            <svg x='50%' y={-1} className='overflow-visible fill-accent/20'>
               <path
                  d='M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z'
                  strokeWidth={0}
               />
            </svg>
            <rect width='100%' height='100%' strokeWidth={0} fill='url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)' />
         </svg>
         <div
            className='absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]'
            aria-hidden='true'
         >
            <div
               className='aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary to-background opacity-20'
               style={{
                  clipPath:
                     'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
               }}
            />
         </div>
         <header className='px-6 pt-6 lg:px-8'>
            <nav className='flex items-center justify-between' aria-label='Global'>
               <Link className='flex items-center gap-2 lg:flex-1' to='/'>
                  <MuseAvatar className='-ml-1.5' />
                  <div className='flex lg:flex-1'>
                     <div className='flex flex-row items-baseline'>
                        <h1 className='relative flex flex-row items-baseline text-2xl font-bold'>
                           <span className='sr-only'>Muse</span>
                           <span className='tracking-tight hover:cursor-pointer'>Muse</span>
                           <sup className='absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold'>[BETA]</sup>
                        </h1>
                     </div>
                  </div>
               </Link>
               <div className='flex flex-1 justify-end'>
                  {isLoggedIn ? (
                     <Link to='/app'>
                        <Button>Enter App</Button>
                     </Link>
                  ) : (
                     <a href={AppConfig.loginEndpoint}>
                        <Button>Sign In</Button>
                     </a>
                  )}
               </div>
            </nav>
         </header>
         <div className='mx-auto max-w-7xl px-6 py-10 lg:flex lg:px-8 lg:pt-40'>
            <div className='mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8'>
               <h1 className='mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl'>
                  Share your music taste with the world
               </h1>

               <h2 className='mt-10 text-xl font-bold tracking-tight text-foreground'>(or just your friends...)</h2>
               <p className='mt-6 text-lg leading-8 text-muted-foreground'>
                  Team up with friends or fellow music enthusiasts to create detailed, interactive reviews of your
                  favorite playlists, albums, and artists on Spotify.
               </p>
               <div className='mt-10 flex items-center gap-x-6'>
                  {isLoggedIn ? (
                     <Link to='/app'>
                        <Button>Get Started</Button>
                     </Link>
                  ) : (
                     <a href={AppConfig.loginEndpoint}>
                        <Button>Get Started</Button>
                     </a>
                  )}
                  <Link to='/info'>
                     <Button variant='outline' className='gap-1'>
                        Learn more <span aria-hidden='true'>→</span>
                     </Button>
                  </Link>
               </div>
               <div className='grid w-full place-items-center'>
                  <div className='mt-20 inline-flex items-center text-lg leading-8'>
                     Powered by
                     <a
                        className={cn('inline-block pl-3 lg:pl-5')}
                        href={'https://www.spotify.com/'}
                        rel='noreferrer'
                        target='_blank'
                     >
                        <img src={spotifyLogo} className='w-24 lg:w-32' />
                     </a>
                  </div>
               </div>
            </div>
            <div className='mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32'>
               <div className='max-w-3xl flex-none sm:max-w-5xl lg:max-w-none'>
                  <img
                     src='landingpageScreenshot.jpg'
                     alt='App screenshot'
                     width={2432}
                     height={1442}
                     className='w-[76rem] rounded-md '
                  />
               </div>
            </div>
         </div>

         <footer className='w-full bg-background'>
            <div className='mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8'>
               <div className='flex justify-center space-x-6 md:order-2'>
                  {Footerlinks.map(item => (
                     <a
                        key={item.name}
                        href={item.href}
                        className='text-foreground hover:text-accent'
                        rel='noreferrer'
                        target='_blank'
                     >
                        <span className='sr-only'>{item.name}</span>
                        <item.icon className='h-6 w-6' aria-hidden='true' />
                     </a>
                  ))}
               </div>
               <div className='mt-8 md:order-1 md:mt-0'>
                  <p className='text-center text-xs leading-5 text-gray-500'>
                     &copy; {new Date().getFullYear()} Nico Burniske. All rights reserved.
                  </p>
               </div>
            </div>
         </footer>
      </div>
   )
}

export const useCurrentUsername = () => {
   const { data } = useCurrentUserQuery(
      {},
      {
         staleTime: 60 * 1000,
         cacheTime: 60 * 1000,
         select: useCallback((data: CurrentUserQuery) => data?.me?.spotifyProfile?.displayName ?? data?.me?.id, []),
      }
   )
   return data
}

const Footerlinks: readonly FooterLink[] = [
   {
      name: 'Twitter',
      href: 'https://twitter.com/nburniske',
      icon: props => (
         <svg fill='currentColor' viewBox='0 0 24 24' {...props}>
            <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
         </svg>
      ),
   },
   {
      name: 'GitHub',
      href: 'https://github.com/nicoburniske/muse-frontend',
      icon: props => (
         <svg fill='currentColor' viewBox='0 0 24 24' {...props}>
            <path
               fillRule='evenodd'
               d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
               clipRule='evenodd'
            />
         </svg>
      ),
   },
] as const

type FooterLink = {
   name: string
   href: string
   icon: Icon
}
