import { CheckCircleIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/lib/component/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/lib/component/Collapsible'
import { Separator } from '@/lib/component/Seperator'
import { AppConfig } from '@/util/AppConfig'

import { useCurrentUsername } from './LandingPage'

export function InfoPage() {
   const isLoggedIn = useCurrentUsername() !== undefined

   return (
      <div className='relative isolate flex h-screen w-full flex-col overflow-y-auto bg-background text-foreground overflow-x-hidden'>
         <header className='px-6 pt-6 lg:px-8'>
            <nav className='flex items-center justify-between' aria-label='Global'>
               <Link className='flex gap-2 lg:flex-1' to='/'>
                  <div className='-m-1.5 p-1.5'>
                     <span className='sr-only'>Muse</span>
                     <img className='h-8' src='/logo.png' alt='' />
                  </div>
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

         <div className='bg-background'>
            <div className='mx-auto max-w-7xl flex-col px-6 py-24 sm:py-32 lg:px-8 lg:py-40'>
               <div className='mx-auto max-w-3xl text-base leading-7 text-foreground'>
                  <p className='text-base font-semibold leading-7 text-primary/40'>Introducing </p>
                  <h1 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>
                     <span className='bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent'>
                        Sonic Connections, Amplified
                     </span>
                  </h1>
                  <p className='mt-6 text-xl leading-8'>
                     Welcome to Muse, your sonic playground designed for those who seek more than just listening to
                     music. We're not just bridging the gap between your thoughts, your friends, and your favorite
                     tunes, we're shattering it. Muse offers an immersive platform for all - from seasoned critics to
                     casual listeners, inviting you to explore the world of music like never before.
                  </p>
                  <Separator className='my-10' />
                  <div className='max-w-2xl'>
                     <p>
                        At Muse, you don't just listen, you interact. You create. You share. Dive into the rhythm of
                        insightful reviews on albums and playlists, igniting vibrant conversations with other music
                        enthusiasts. Our unique feature allows you to infuse comments directly into the tracks,
                        referencing specific points like dynamic Youtube comments, each change instantly rendered
                        through GraphQL Subscription events, for real-time interaction.
                     </p>
                     <br />
                     <p>
                        And with our event-driven architecture, your review updates are shared live, making new comments
                        pop up instantly for all viewers. Experience the thrill of a live conversation centered around
                        your favorite tunes.
                     </p>
                     <br />
                     <p>
                        Join Muse to embark on an enriching musical journey where your voice harmonizes with the melody
                        that unites us all. Welcome to Muse, your new haven for amplifying sonic connections.
                     </p>
                     <br />
                     <ul role='list' className='mt-8 max-w-xl space-y-8 text-gray-600'>
                        <li className='flex gap-x-3'>
                           <CheckCircleIcon className='mt-1 h-5 w-5 flex-none text-primary' aria-hidden='true' />
                           <span>
                              <strong className='mr-2 font-semibold text-primary'>Deep Spotify Integration.</strong>
                              Playback controls integrated into comments for referencing specific points in songs,
                              creating a dynamic and interactive music discussion platform.
                           </span>
                        </li>
                        <li className='flex gap-x-3'>
                           <CheckCircleIcon className='mt-1 h-5 w-5 flex-none text-primary' aria-hidden='true' />
                           <span>
                              <strong className='mr-2 font-semibold text-primary'>Event Driven.</strong> With our live
                              review updates, witness the appearance of new comments in real time, fostering an engaging
                              and instantaneous dialogue.
                           </span>
                        </li>
                     </ul>
                  </div>
               </div>
               <div className='mx-auto mt-20 max-w-3xl divide-y divide-foreground/10'>
                  <h2 className='text-2xl font-bold leading-10 tracking-tight text-foreground'>
                     Frequently asked questions
                  </h2>
                  <dl className='mt-10 space-y-6 divide-y divide-foreground/10'>
                     {FAQs.map(faq => (
                        <CollapsibleFaq key={faq.question} {...faq} />
                     ))}
                  </dl>
               </div>
            </div>
         </div>
      </div>
   )
}

const CollapsibleFaq = (props: { question: string; answer: ReactNode }) => {
   const [open, setIsOpen] = useState(false)

   return (
      <Collapsible open={open} onOpenChange={setIsOpen} className='w-full space-y-2'>
         <CollapsibleTrigger asChild>
            <div className='flex items-center justify-between space-x-4 px-4'>
               <h4 className='text-lg font-semibold leading-7'>{props.question}</h4>
               <Button variant='ghost' size='sm' className='w-9 p-0'>
                  {open ? <MinusIcon className='h-4 w-4' /> : <PlusIcon className='h-4 w-4' />}
                  <span className='sr-only'>Toggle</span>
               </Button>
            </div>
         </CollapsibleTrigger>
         <CollapsibleContent className='space-y-2'>
            <div className='rounded-md border bg-popover px-4 py-3 font-mono text-sm text-popover-foreground'>
               {' '}
               {props.answer}
            </div>
         </CollapsibleContent>
      </Collapsible>
   )
}

const FAQs = [
   {
      question: 'What is Muse?',
      answer:
         'Muse is a platform for music lovers to create interactive and collaborative reviews for music on Spotify.',
   },
   {
      question: 'Who is Muse for?',
      answer: 'Muse is designed for anyone with a Spotify Premium subscription.',
   },
   {
      question: 'How do I get started with Muse?',
      answer: 'Simply sign up for an account using your Spotify Premium credentials and start creating your reviews!',
   },
   {
      question: 'What is a review?',
      answer: 'A review consists of comments, which can be replied to, re-ordered, and deleted.',
   },
   {
      question: 'What are collaborators?',
      answer: 'Collaborators are Muse users with access to your review. There are two levels: editors and viewers.',
   },
   {
      question: 'Who can make comments?',
      answer: 'Review Creators or Editors (Collaborators with edit access) can create and manage comments.',
   },
   {
      question: 'Who can view your review?',
      answer: 'Public reviews are visible to everyone, while private reviews are only accessible by Collaborators.',
   },
   {
      question: 'What devices or platforms are supported?',
      answer: 'Muse is a web-based platform, compatible with most modern web browsers on desktop and mobile devices.',
   },
   {
      question: 'Where can I find help or troubleshooting assistance?',
      answer: (
         <p>
            <Button variant='link'> Submit a GitHub Issue </Button>for any issues or questions you might have.{' '}
         </p>
      ),
   },
   {
      question: "Where's the source code?",
      answer: (
         <div className='flex flex-col gap-4'>
            <div>
               <a
                  href={'github.com/nicoburniske/muse'}
                  className='text-primary underline-offset-4 hover:underline'
                  rel='noreferrer'
                  target='_blank'
               >
                  Backend repo is available here.
               </a>
            </div>
            <div>
               <a
                  href={'github.com/nicoburniske/muse-frontend'}
                  className='text-primary underline-offset-4 hover:underline'
                  rel='noreferrer'
                  target='_blank'
               >
                  Frontend repo is available here.
               </a>
            </div>
         </div>
      ),
   },
]
