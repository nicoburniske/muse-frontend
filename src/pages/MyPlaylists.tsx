import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { MuseAvatar } from '@/component/avatar/MuseAvatar'
import { CommandButton } from '@/component/command/Command'
import { MobileNavigation } from '@/component/container/MobileMenu'
import { useCreateReviewModal } from '@/component/createReview/CreateReviewModal'
import { ListenOnSpotifyLogoTooltip } from '@/component/ListenOnSpotify'
import {
   MyPlaylistsQuery,
   PlaylistDetailsFragment,
   useGetPlaylistQuery,
   useMyPlaylistsQuery,
} from '@/graphql/generated/schema'
import { Button } from '@/lib/component/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/component/Card'
import { SearchInputKbdSuggestion } from '@/lib/component/SearchInputKbdSuggestion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/lib/component/Sheet'
import { Tabs, TabsList, TabsTrigger } from '@/lib/component/Tabs'
import { searchLoweredAtom, useSearchAtom } from '@/state/Atoms'
import { useCurrentUserDisplayName, useCurrentUserId } from '@/state/CurrentUser'
import { cn, nonNullable, userDisplayNameOrId } from '@/util/Utils'

export const MyPlaylistsPage = () => {
   const data = useMyPlaylists()

   if (!data) {
      return <div>Error</div>
   } else {
      return <MyPlaylists playlists={data} />
   }
}

const RefreshButton = () => {
   const { refetch, isFetching } = useMyPlaylistsQuery({}, { staleTime: Infinity })

   return (
      <Button onClick={() => refetch()}>
         <span className='sr-only'>Refresh</span>
         <ArrowPathIcon className={cn(isFetching ? 'animate-spin' : '', 'h-6 w-6')} aria-hidden='true' />
      </Button>
   )
}

const MyPlaylists = ({ playlists }: { playlists: PlaylistDetailsFragment[] }) => {
   return (
      <>
         <div className='flex flex-1 flex-col bg-background'>
            <header className='w-full'>
               <div className='relative flex h-16 flex-shrink-0 items-center border-b p-1 shadow-sm'>
                  <MobileNavigation />
                  <div className='align-center flex flex-1 justify-center px-4 py-2'>
                     <CommandButton />
                     {/* <SearchBar /> */}
                  </div>
                  <MuseAvatar className='mx-1 flex h-8 w-8 md:hidden' />
               </div>
            </header>

            {/* Main content */}
            <div className='flex flex-1 items-stretch overflow-hidden'>
               <main className='muse-scrollbar flex-1 overflow-y-auto'>
                  <div className='mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8'>
                     <div className='flex'>
                        <h1 className='flex-1 text-2xl font-bold text-foreground'>Playlists</h1>
                        <RefreshButton />
                     </div>
                     <FilterTabs />

                     {/* Gallery */}
                     <section className='mt-8 pb-16' aria-labelledby='gallery-heading'>
                        <h2 id='gallery-heading' className='sr-only'>
                           Recently viewed
                        </h2>
                        <ul
                           role='list'
                           className='grid grid-cols-3 gap-x-2 gap-y-8 animate-in fade-in duration-300 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-8'
                        >
                           {playlists.map(p => (
                              <BrowseCard key={p.id} playlist={p} />
                           ))}
                        </ul>
                     </section>
                  </div>
               </main>
            </div>
         </div>
         <SelectedPlaylist />
      </>
   )
}

const SearchBar = () => {
   const [search, setSearch] = useSearchAtom()

   return (
      <div className='max-w-3xl flex-1'>
         <SearchInputKbdSuggestion
            screenReaderLabel='Search Playlists'
            placeholder={'Search Playlists'}
            search={search}
            setSearch={setSearch as (s: string) => void}
         />
      </div>
   )
}

const PlaylistFilters = ['All', 'Owned', 'Blend', 'By Spotify', 'By Others'] as const
type PlaylistFilter = (typeof PlaylistFilters)[number]
const playlistFilterAtom = atom<PlaylistFilter>('All')

const FilterTabs = ({ className }: { className?: string }) => {
   const [sortOrder, setSortOrder] = useAtom(playlistFilterAtom)

   return (
      <Tabs value={sortOrder} onValueChange={v => setSortOrder(v as PlaylistFilter)}>
         <TabsList className={className}>
            {PlaylistFilters.map(value => (
               <TabsTrigger key={value} value={value as PlaylistFilter} className='text-xs sm:text-sm'>
                  {value}
               </TabsTrigger>
            ))}
         </TabsList>
      </Tabs>
   )
}

function BrowseCard({ playlist }: { playlist: PlaylistDetailsFragment }) {
   const image = playlist.images.at(1) ?? playlist.images.at(0)
   const creatorName = playlist?.owner?.spotifyProfile?.displayName ?? playlist.owner.id
   const { setSelectedPlaylist } = useSelectPlaylist()
   const openDetails = () => setSelectedPlaylist(playlist.id)

   const nav = useNavigate()
   const linkToPlaylist = () => nav(`/app/playlists/${playlist.id}`)
   const linkToProfile = () => nav(`/app/user/${playlist.owner.id}`)

   return (
      <Card
         onClick={linkToPlaylist}
         className='relative cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg '
      >
         <CardHeader className='space-y-0 p-4 pb-0'>
            <CardTitle className='line-clamp-1 text-base'>{playlist.name}</CardTitle>
            <Button
               variant='link'
               size='sm'
               onClick={e => {
                  linkToProfile()
                  e.stopPropagation()
               }}
               className='inline-flex justify-start truncate px-0 py-0 text-sm text-muted-foreground md:text-base'
            >
               {creatorName}
            </Button>
         </CardHeader>

         <CardContent className='p-2'>
            <div className='aspect-h-4 aspect-w-4'>
               {/* No image distortion and crop the image into center */}
               <img src={image} alt='ReviewImage' className='object-cover object-center' />
            </div>
         </CardContent>
      </Card>
   )
}

const selectedPlaylistOpenAtom = atom(false)
const selectedPlaylistIdAtom = atom<string | undefined>(undefined)
const openSelectedPlaylist = atom(null, (_get, set, playlistId: string) => {
   set(selectedPlaylistOpenAtom, true)
   set(selectedPlaylistIdAtom, playlistId)
})
const closeSelectedPlaylistAtom = atom(null, (_get, set) => {
   set(selectedPlaylistOpenAtom, false)
   setTimeout(() => set(selectedPlaylistIdAtom, undefined), 500)
})
export const useSelectPlaylist = () => {
   const setSelectedPlaylist = useSetAtom(openSelectedPlaylist)
   const closeSelectedPlaylist = useSetAtom(closeSelectedPlaylistAtom)
   return useMemo(
      () => ({
         setSelectedPlaylist,
         closeSelectedPlaylist,
      }),
      [setSelectedPlaylist, closeSelectedPlaylist]
   )
}

// We need to subscribe to the review overview in react query cache.
const useSelectedPlaylist = () => {
   const playlistId = useAtomValue(selectedPlaylistIdAtom)
   const { data } = useMyPlaylistsQuery(
      {},
      {
         select: useCallback(
            (data: MyPlaylistsQuery) => data?.user?.playlists?.find(r => r.id === playlistId),
            [playlistId]
         ),
         staleTime: Infinity,
      }
   )

   const { data: allData } = useGetPlaylistQuery(
      { id: playlistId! },
      {
         enabled: !!playlistId,
         staleTime: Infinity,
      }
   )

   return data ?? allData?.getPlaylist
}

export const SelectedPlaylist = () => {
   const { closeSelectedPlaylist } = useSelectPlaylist()
   // Close review details after going to new page.
   useEffect(() => () => closeSelectedPlaylist(), [closeSelectedPlaylist])
   const selectedReviewOpen = useAtomValue(selectedPlaylistOpenAtom)
   const playlist = useSelectedPlaylist()

   return playlist ? (
      <Sheet
         open={selectedReviewOpen}
         onOpenChange={open => {
            if (!open) closeSelectedPlaylist()
         }}
      >
         {selectedReviewOpen && playlist && <SelectedPlaylistContent playlist={playlist} />}
      </Sheet>
   ) : null
}

const textColorSecondary = 'text-secondary-content/50'

const SelectedPlaylistContent = ({ playlist }: { playlist: PlaylistDetailsFragment }) => {
   const { openCreateReview } = useCreateReviewModal()
   const open = () =>
      openCreateReview({
         entityId: playlist.id,
         entityImage: playlist.images.at(0) ?? '',
         entityName: playlist.name,
         entityType: 'Playlist',
      })

   const info = Object.fromEntries(
      Object.entries({
         'Playlist Owner': userDisplayNameOrId(playlist?.owner),
         Public: playlist?.public ? 'True' : 'False',
         'Number of Tracks': playlist.numberOfTracks.toString(),
         Description: playlist.description,
      }).filter(([, value]) => nonNullable(value) && value.length > 0)
   )

   const image = playlist.images.at(0)

   return (
      <SheetContent position='right' size='content' className='overflow-y-auto'>
         <SheetHeader>
            <SheetTitle>
               <span className='sr-only'>Details for {playlist.name} </span>
               {playlist.name}
            </SheetTitle>
         </SheetHeader>
         <div className='flex w-56 flex-col items-center lg:w-96 '>
            <img src={image} alt='Playlist Image' className='m-auto object-cover py-2' />

            <div className='grid place-items-center'>
               <ListenOnSpotifyLogoTooltip entityId={playlist.id} entityType={'Playlist'} />
            </div>

            <div className='flex w-full flex-1 flex-col items-center justify-between'>
               <div className='flex w-full flex-col items-center space-y-6 overflow-hidden px-2 md:px-4 lg:px-8'>
                  <h3 className='self-start font-medium'>Information</h3>
                  <dl className='divide-secondary-content/50 mt-2 w-full divide-y'>
                     {Object.keys(info).map(key => (
                        <div key={key} className='flex justify-between py-3 text-sm font-medium'>
                           <dt className={cn(textColorSecondary)}>{key}</dt>
                           <dd className='text-right'>{info[key]}</dd>
                        </div>
                     ))}
                  </dl>
               </div>

               <Button type='button' onClick={open} className='mt-6'>
                  Create Review
               </Button>
            </div>
         </div>
      </SheetContent>
   )
}

const useMyPlaylists = () => {
   const { data } = useMyPlaylistsQuery(
      {},
      {
         select: useCallback((data: MyPlaylistsQuery) => data.user.playlists ?? [], []),
         suspense: true,
         staleTime: 5 * 60 * 1000,
      }
   )
   const playlistFilter = useAtomValue(playlistFilterAtom)
   const displayName = useCurrentUserDisplayName()
   const userId = useCurrentUserId()
   const search = useAtomValue(searchLoweredAtom)

   if (!data) {
      return undefined
   }
   const filtered = data.filter(p => p.name.toLowerCase().includes(search))

   if (playlistFilter == 'All') {
      return filtered
   } else if (playlistFilter === 'Owned') {
      return filtered.filter(p => p.owner.id === userId)
   } else if (playlistFilter === 'Blend') {
      return filtered.filter(isPlaylistBlend(displayName))
   } else if (playlistFilter === 'By Spotify') {
      return filtered.filter(p => p.owner.id === 'spotify')
   } else if (playlistFilter === 'By Others') {
      return filtered.filter(p => p.owner.id !== userId).filter(p => p.owner.id !== 'spotify')
   }
}

const isPlaylistBlend = (currentUserDisplayname: string) => (playlist: PlaylistDetailsFragment) => {
   const name = playlist.name
   const creatorId = playlist.owner.id
   const suffix = '+ ' + currentUserDisplayname.split(' ')[0]

   return creatorId == 'spotify' && name.endsWith(suffix) && name.split(' ').length == 3
}
