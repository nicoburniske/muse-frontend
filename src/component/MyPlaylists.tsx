import { EntityType, MyPlaylistsQuery, PlaylistDetailsFragment, useMyPlaylistsQuery } from 'graphql/generated/schema'
import { useCallback, useEffect, useMemo } from 'react'
import { OpenMobileMenuButton } from './nav/OpenMobileMenuButton'
import { ArrowPathIcon, Bars3BottomLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { SearchInputKbdSuggestion } from 'platform/component/SearchInputKbdSuggestion'
import { searchLoweredAtom, useSearchAtom } from 'state/Atoms'
import { MuseTransition } from 'platform/component/MuseTransition'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import RightSidePane from 'platform/component/RightSidePane'
import { classNames, nonNullable, userDisplayNameOrId } from 'util/Utils'
import { useCurrentDisplayName, useCurrentUserId } from 'state/CurrentUser'
import { CreateReviewModal, useCreateReviewModal } from './createReview/CreateReviewModal'

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
      <button type='button' className='btn btn-primary' onClick={() => refetch()}>
         <span className='sr-only'>Refresh</span>
         <ArrowPathIcon className={classNames(isFetching ? 'animate-spin' : '', 'h-6 w-6')} aria-hidden='true' />
      </button>
   )
}

const MyPlaylists = ({ playlists }: { playlists: PlaylistDetailsFragment[] }) => {
   return (
      <>
         <div className='flex flex-1 flex-col bg-base-100'>
            <header className='w-full'>
               <div className='relative z-10 flex h-16 flex-shrink-0 shadow-sm'>
                  <OpenMobileMenuButton>
                     {onClick => (
                        <button
                           type='button'
                           className='btn btn-primary m-auto h-full px-4 md:hidden'
                           onClick={onClick}
                        >
                           <span className='sr-only'>Open sidebar</span>
                           <Bars3BottomLeftIcon className='h-6 w-6' aria-hidden='true' />
                        </button>
                     )}
                  </OpenMobileMenuButton>
                  <div className='align-center flex flex-1 justify-center py-2 px-4'>
                     <SearchBar />
                  </div>
               </div>
            </header>

            {/* Main content */}
            <div className='flex flex-1 items-stretch overflow-hidden'>
               <main className='flex-1 overflow-y-auto'>
                  <div className='mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8'>
                     <div className='flex'>
                        <h1 className='flex-1 text-2xl font-bold text-base-content'>Playlists</h1>
                        <RefreshButton />
                     </div>
                     <FilterTabs />

                     {/* Gallery */}
                     <section className='mt-8 pb-16' aria-labelledby='gallery-heading'>
                        <h2 id='gallery-heading' className='sr-only'>
                           Recently viewed
                        </h2>
                        <MuseTransition option={'Simple'} duration='duration-500'>
                           <ul
                              role='list'
                              className='grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 xl:gap-x-8'
                           >
                              {playlists.map(p => (
                                 <BrowseCard key={p.id} playlist={p} />
                              ))}
                           </ul>
                        </MuseTransition>
                     </section>
                  </div>
               </main>
            </div>
         </div>
         <SelectedPlaylist />
         <CreateReviewModal />
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
            setSearch={setSearch}
         />
      </div>
   )
}

const PlaylistFilterValues = ['All', 'Owned', 'Blend', 'Made by Spotify', 'Made by Others'] as const
type PlaylistFilter = (typeof PlaylistFilterValues)[number]
const playlistFilterAtom = atom<PlaylistFilter>('All')

const FilterTabs = ({ className }: { className?: string }) => {
   const [sortOrder, setSortOrder] = useAtom(playlistFilterAtom)

   return (
      <div id='tabs' className={classNames('tabs', className)}>
         {PlaylistFilterValues.map(f => (
            <a
               key={f}
               className={classNames('tab tab-bordered', sortOrder === f ? 'tab-active' : '')}
               onClick={() => setSortOrder(f as PlaylistFilter)}
            >
               {f}
            </a>
         ))}
      </div>
   )
}

function BrowseCard({ playlist }: { playlist: PlaylistDetailsFragment }) {
   const image = playlist.images.at(0)
   const creatorName = playlist?.owner?.spotifyProfile?.displayName ?? 'Unknown'
   const diffUserName = playlist.owner.id !== playlist.owner.spotifyProfile?.displayName
   const { setSelectedPlaylist } = useSelectPlaylist()
   const onClick = () => setSelectedPlaylist(playlist.id)

   return (
      <div
         className='cursor-pointer bg-base-200 shadow transition-all duration-200 hover:-translate-y-0.5 hover:bg-base-300 hover:shadow-xl'
         onClick={onClick}
      >
         {/* This ensures that we have square aspect ratio */}
         <div className='aspect-w-4 aspect-h-4'>
            {/* No image distortion and crop the image into center */}
            <img src={image} alt='ReviewImage' className='object-cover object-center' />
         </div>

         <div className='mt-auto flex flex-col items-center justify-center text-center'>
            <div className='w-full truncate text-xs font-extrabold md:text-base'>{playlist.name}</div>
            {diffUserName && <div className='stat-desc w-full truncate text-xs md:text-base'>{creatorName}</div>}
            <a className='text-xs text-base-content/50 hover:underline'>@{playlist.owner.id}</a>
         </div>
      </div>
   )
}

const selectedPlaylistOpenAtom = atom(false)
const selectedPlaylistIdAtom = atom<string | undefined>(undefined)
const openSelectedPlaylist = atom(null, (_get, set, reviewId: string) => {
   set(selectedPlaylistOpenAtom, true)
   set(selectedPlaylistIdAtom, reviewId)
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
   return data
}

const SelectedPlaylist = () => {
   const { closeSelectedPlaylist } = useSelectPlaylist()
   // Close review details after going to new page.
   useEffect(() => () => closeSelectedPlaylist(), [closeSelectedPlaylist])
   const selectedReviewOpen = useAtomValue(selectedPlaylistOpenAtom)
   const playlist = useSelectedPlaylist()

   return (
      <RightSidePane isOpen={selectedReviewOpen}>
         {selectedReviewOpen && playlist && <SelectedPlaylistContent playlist={playlist} />}
      </RightSidePane>
   )
}

const textColorSecondary = 'text-secondary-content/50'

const SelectedPlaylistContent = ({ playlist }: { playlist: PlaylistDetailsFragment }) => {
   const { closeSelectedPlaylist } = useSelectPlaylist()

   const { open } = useCreateReviewModal({
      entityId: playlist.id,
      entityImage: playlist.images.at(0) ?? '',
      entityName: playlist.name,
      entityType: EntityType.Playlist,
   })

   const info = Object.fromEntries(
      Object.entries({
         'Playlist Owner': userDisplayNameOrId(playlist?.owner),
         Public: playlist?.public ? 'True' : 'False',
         'Number of Tracks': playlist.numberOfTracks,
         Followers: playlist.numberOfFollowers,
      }).filter(([, value]) => nonNullable(value))
   )

   return (
      <div className='flex flex-col items-center space-y-2'>
         <div className='mt-4 flex w-full items-start justify-start space-x-5 pl-1'>
            <button type='button' className='btn btn-ghost btn-square' onClick={() => closeSelectedPlaylist()}>
               <span className='sr-only'>Close panel</span>
               <ChevronRightIcon className='h-8 w-8' aria-hidden='true' />
            </button>

            <div>
               <h2 className='text-xl font-bold'>
                  <span className='sr-only'>Details for </span>
                  {playlist.name}
               </h2>
               <p className={classNames('text-sm font-medium', textColorSecondary)}>Playlist</p>
            </div>
         </div>
         <div>
            <img src={playlist.images.at(0)} alt='' className='h-full w-full object-cover' />
         </div>
         <div className='w-full space-y-6 overflow-hidden px-2 md:px-4 lg:px-8'>
            <div>
               <h3 className='font-medium'>Information</h3>
               <dl className='mt-2 divide-y divide-secondary-content/50'>
                  {Object.keys(info).map(key => (
                     <div key={key} className='flex justify-between py-3 text-sm font-medium'>
                        <dt className={classNames(textColorSecondary)}>{key}</dt>
                        <dd className='text-right'>{info[key]}</dd>
                     </div>
                  ))}
               </dl>
            </div>
         </div>
         <button type='button' className=' btn btn-primary' onClick={open}>
            Create Review
         </button>
      </div>
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
   const displayName = useCurrentDisplayName()
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
   } else if (playlistFilter === 'Made by Spotify') {
      return filtered.filter(p => p.owner.id === 'spotify')
   } else if (playlistFilter === 'Made by Others') {
      return filtered.filter(p => p.owner.id !== userId).filter(p => p.owner.id !== 'spotify')
   }
}

const isPlaylistBlend = (currentUserDisplayname: string) => (playlist: PlaylistDetailsFragment) => {
   const name = playlist.name
   const creatorId = playlist.owner.id
   const suffix = '+ ' + currentUserDisplayname.split(' ')[0]

   return creatorId == 'spotify' && name.endsWith(suffix) && name.split(' ').length == 3
}
