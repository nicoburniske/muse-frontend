import {
   ChatBubbleLeftRightIcon,
   CheckIcon,
   ListBulletIcon,
   MusicalNoteIcon,
   PlusIcon,
} from '@heroicons/react/24/outline'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import { Artist, SearchType, SimplifiedAlbum, SimplifiedPlaylist } from 'spotify-web-api-ts/types/types/SpotifyObjects'

import {
   EntityType,
   MyPlaylistsQuery,
   PlaylistDetailsFragment,
   useMyPlaylistsQuery,
   useProfileAndReviewsQuery,
} from '@/graphql/generated/schema'
import atomWithDebounce from '@/lib/atom/atomWithDebounce'
import { Button } from '@/lib/component/Button'
import {
   CommandDialog,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
   CommandSeparator,
} from '@/lib/component/Command'
import { Skeleton } from '@/lib/component/Skeleton'
import { useTransientAtom } from '@/lib/hook/useTransientAtom'
import { useCurrentUserId } from '@/state/CurrentUser'
import { Themes, useTheme } from '@/state/UserPreferences'
import { cn, getReviewOverviewImage, userDisplayNameOrId } from '@/util/Utils'

import { CreateReviewModal, useCreateReviewModal } from './createReview/CreateReviewModal'
import { useSearchSpotify } from './sdk/ClientHooks'

const openAtom = atom(false)

const searchAtom = atomWithDebounce('')
const useCurrentSearch = () => {
   return [useAtomValue(searchAtom.currentValueAtom), useSetAtom(searchAtom.debouncedValueAtom)] as [
      string,
      (newSearch: string) => void
   ]
}

const pagesAtom = atom<string[]>([])
const setPageAndClearAtom = atom(null, (get, set, page: string) => {
   set(pagesAtom, pages => [...pages, page])
   set(searchAtom.debouncedValueAtom, '')
})
const currentPageAtom = atom(get => {
   const pages = get(pagesAtom)
   if (pages.length === 0) {
      return null
   } else {
      return pages[pages.length - 1]
   }
})

type CommandGroup = {
   header: string
   items: {
      id: string
      label: string
      onSelect: () => void
      icon?: (props: React.ComponentProps<'svg'>) => JSX.Element
   }[]
   // content: JSX.Element
}
const extraCommandGroups = atom<CommandGroup[]>([])

export const useSetExtraCommandGroups = (pages: CommandGroup[]) => {
   const setExtraCommandGroups = useSetAtom(extraCommandGroups)
   useEffect(() => {
      setExtraCommandGroups(pages)
      return () => setExtraCommandGroups([])
   }, [pages])
}

export const useExecuteAndClose = () => {
   const setOpen = useSetAtom(openAtom)
   return useCallback(
      (func: () => void) => {
         func()
         setOpen(false)
      },
      [setOpen]
   )
}

export const CommandButton = () => {
   const setOpen = useSetAtom(openAtom)
   return (
      <Button
         variant='outline'
         className={cn(
            'relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-52 lg:w-96'
         )}
         onClick={() => setOpen(true)}
      >
         <span className='hidden lg:inline-flex'>Search...</span>
         <span className='inline-flex lg:hidden'>Search...</span>
         <kbd className='pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
            <span className='text-xs'>⌘</span>K
         </kbd>
      </Button>
   )
}

export const CommandMenu = () => {
   const currentUserId = useCurrentUserId()
   const nav = useNavigate()

   const [open, setOpen] = useAtom(openAtom)
   const [search, setSearch] = useCurrentSearch()
   const setPages = useSetAtom(pagesAtom)
   const page = useAtomValue(currentPageAtom)

   const executeAndClose = useExecuteAndClose()

   useHotkeys(
      ['meta+k', 'ctrl+k'],
      useCallback(() => setOpen(true), [setOpen]),
      [setOpen]
   )

   const setPageAndClear = useSetAtom(setPageAndClearAtom)

   const extraGroups = useAtomValue(extraCommandGroups)

   const isCreateReview = page === 'Create Album Review' || page === 'Create Playlist Review'
   const createType = (() => {
      const lowered = page?.toLowerCase()
      if (lowered?.includes('album')) {
         return 'Albums'
      } else if (lowered?.includes('artist')) {
         return 'Artists'
      } else {
         return 'Playlists'
      }
   })()

   return (
      <>
         <CommandDialog
            open={open}
            onOpenChange={o => {
               if (!o) {
                  setSearch('')
               }
               setOpen(o)
            }}
         >
            <CommandInput
               value={search}
               onValueChange={setSearch}
               placeholder={isCreateReview ? `Search Spotify ${createType}` : 'Type a command or search...'}
               onKeyDown={e => {
                  // Escape goes to previous page when not base level.
                  // Backspace goes to previous page when search is empty
                  if ((e.key === 'Escape' && page !== null) || (e.key === 'Backspace' && !search)) {
                     e.preventDefault()
                     setPages(pages => pages.slice(0, -1))
                  }
               }}
            />

            <CommandList className='max-h-[300px] lg:max-h-[500px]'>
               <CommandEmpty>No results found.</CommandEmpty>

               {!page && (
                  <>
                     {extraGroups.map(g => (
                        <CommandGroup key={g.header} heading={g.header}>
                           {g.items.map(item => {
                              const { id, label, onSelect, icon } = item
                              return (
                                 <CommandItem key={id} onSelect={onSelect}>
                                    {icon === undefined ? null : <item.icon className='mr-2 h-4 w-4' />}
                                    {label}
                                 </CommandItem>
                              )
                           })}
                        </CommandGroup>
                     ))}
                     <CommandGroup heading='Suggestions'>
                        <CommandItem onSelect={() => setPageAndClear('Create Review')}>
                           <PlusIcon className='mr-2 h-4 w-4' />
                           Create a review
                        </CommandItem>
                        <CommandItem onSelect={() => setPageAndClear('reviews')}>
                           <ChatBubbleLeftRightIcon className='mr-2 h-4 w-4' />
                           Search your reviews…
                        </CommandItem>
                        <CommandItem onSelect={() => setPageAndClear('playlists')}>
                           <MusicalNoteIcon className='mr-2 h-4 w-4' />
                           Search your playlists...
                        </CommandItem>
                     </CommandGroup>
                     <CommandSeparator />
                     <CommandGroup heading='Pages'>
                        <CommandItem onSelect={() => executeAndClose(() => nav('/app/reviews'))}>
                           Your reviews
                        </CommandItem>
                        <CommandItem onSelect={() => executeAndClose(() => nav('/app/playlists'))}>
                           Your playlists
                        </CommandItem>
                        <CommandItem onSelect={() => executeAndClose(() => nav(`/app/user/${currentUserId}`))}>
                           Your profile
                        </CommandItem>
                        <CommandItem onSelect={() => executeAndClose(() => nav('/app/search'))}>
                           Search Spotify
                        </CommandItem>
                     </CommandGroup>
                     <CommandSeparator />
                     <ThemeGroup />
                  </>
               )}

               <CommandSeparator />

               {page === 'Create Review' && (
                  <CommandGroup heading='Select Review Type'>
                     <CommandItem onSelect={() => setPageAndClear('Create Album Review')}>
                        <svg
                           xmlns='http://www.w3.org/2000/svg'
                           width='24'
                           height='24'
                           viewBox='0 0 24 24'
                           fill='none'
                           stroke='currentColor'
                           strokeWidth='2'
                           strokeLinecap='round'
                           strokeLinejoin='round'
                           className='mr-2 h-4 w-4'
                        >
                           <circle cx='12' cy='12' r='4'></circle>
                           <circle cx='12' cy='12' r='10'></circle>
                           <line x1='12' y1='12' x2='12' y2='12.01'></line>
                        </svg>
                        Create Album Review
                     </CommandItem>
                     <CommandItem onSelect={() => setPageAndClear('Create Playlist Review')}>
                        <ListBulletIcon className='mr-2 h-4 w-4' />
                        Create Playlist Review
                     </CommandItem>
                  </CommandGroup>
               )}
               {isCreateReview && <CreateReviewGroup />}
               {page === 'reviews' && <ReviewGroup />}
               {page === 'playlists' && <PlaylistGroup />}
               <CommandSeparator />
            </CommandList>
         </CommandDialog>
         <CreateReviewModal />
      </>
   )
}

const ReviewGroup = () => {
   const currentUserId = useCurrentUserId()
   const { data } = useProfileAndReviewsQuery(
      { userId: currentUserId },
      {
         suspense: true,
         staleTime: 60 * 1000,
      }
   )
   const reviews = data?.user?.reviews ?? []

   const executeAndClose = useExecuteAndClose()
   const nav = useNavigate()
   const navToReview = useCallback((reviewId: string) => () => nav(`/app/reviews/${reviewId}`), [nav])
   const displayName = userDisplayNameOrId(r.creator)

   return (
      <CommandGroup heading='Your Reviews'>
         {reviews.map(r => (
            <CommandItem
               key={r.id}
               onSelect={() => executeAndClose(navToReview(r.id))}
               value={`${r.reviewName} ${displayName}`}
            >
               <div className='flex w-full items-center justify-between'>
                  <div className='flex items-center gap-4'>
                     <img src={getReviewOverviewImage(r, 1)} className='h-12 w-12 object-cover object-center' />
                     <span>{r.reviewName}</span>
                  </div>
                  <span>{displayName}</span>
               </div>
            </CommandItem>
         ))}
      </CommandGroup>
   )
}

const PlaylistGroup = () => {
   const { data, isLoading } = useMyPlaylistsQuery(
      {},
      {
         select: useCallback((data: MyPlaylistsQuery) => data.user.playlists ?? [], []),
         staleTime: 5 * 60 * 1000,
      }
   )
   const playlists = data ?? []
   const executeAndClose = useExecuteAndClose()
   const nav = useNavigate()
   const navToPlaylist = useCallback((playlistId: string) => () => nav(`/app/playlists/${playlistId}`), [nav])

   return (
      <CommandGroup heading='Your Playlists'>
         {isLoading
            ? Array(10)
                 .fill(0)
                 .map((_, i) => (
                    <CommandItem key={i} disabled>
                       <SearchResultSkeleton />
                    </CommandItem>
                 ))
            : playlists.map(p => (
                 <CommandItem
                    key={p.id}
                    onSelect={() => executeAndClose(navToPlaylist(p.id))}
                    value={`${p.name}-${userDisplayNameOrId(p.owner)}`}
                 >
                    <div className='flex w-full items-center justify-between'>
                       <div className='flex items-center gap-4'>
                          <img src={p.images.at(-1)} className='h-12 w-12 object-cover object-center' />
                          <span>{p.name}</span>
                       </div>
                       <span>{userDisplayNameOrId(p.owner)}</span>
                    </div>
                 </CommandItem>
              ))}
      </CommandGroup>
   )
}

const ThemeOptions = [...Themes].sort((a, b) => a.localeCompare(b))

const ThemeGroup = () => {
   const [currentTheme, setTheme] = useTheme()

   return (
      <CommandGroup heading='Change your theme'>
         {ThemeOptions.map(theme => (
            <CommandItem
               key={theme}
               onSelect={() => setTheme(theme)}
               className='relative mx-1'
               value={`${theme}-theme`}
            >
               {theme === currentTheme ? (
                  <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                     <CheckIcon className='h-4 w-4' />
                  </span>
               ) : null}
               <div className='ml-8 flex grow items-center justify-between'>
                  <span>{theme}</span>
                  <span className='flex h-6 w-12 justify-evenly bg-background' data-theme={theme}>
                     <span className='w-2 bg-primary' />
                     <span className='w-2 bg-secondary' />
                     <span className='w-2 bg-accent' />
                     <span className='w-2 bg-muted' />
                     <span className='w-2 bg-popover' />
                  </span>
               </div>
            </CommandItem>
         ))}
      </CommandGroup>
   )
}

const CreateReviewGroup = () => {
   const query = useAtomValue(searchAtom.debouncedValueAtom)
   const [getCurrentQuery] = useTransientAtom(searchAtom.currentValueAtom)
   const page = useAtomValue(currentPageAtom) ?? ''

   const type = (() => {
      const pageLowered = page.toLowerCase()
      if (pageLowered.includes('album')) {
         return 'album'
      } else if (pageLowered.includes('playlist')) {
         return 'playlist'
      } else {
         return 'album'
      }
   })() as SearchType
   console.log('type', type)

   const searchConfig = (() => {
      if (query.length > 0) {
         return {
            type: [type],
            query,
         }
      }
      return null
   })()

   const enabled = searchConfig !== null
   const { data, isLoading } = useSearchSpotify(searchConfig!, { enabled })
   const { data: playlistData } = useMyPlaylistsQuery(
      {},
      {
         select: useCallback((data: MyPlaylistsQuery) => data.user.playlists ?? [], []),
         staleTime: 5 * 60 * 1000,
      }
   )
   // TODO: get rid of duplicates.
   const playlists = playlistData ?? []
   const results = data?.albums?.items ?? data?.playlists?.items ?? []

   const heading = `${type.charAt(0).toUpperCase() + type.slice(1)} Search Results`

   if (isLoading && enabled) {
      return (
         <CommandGroup heading={heading}>
            {Array(10)
               .fill(0)
               .map((_, i) => (
                  // so the rows don't get filtered out.
                  <CommandItem key={i} disabled value={getCurrentQuery()}>
                     <SearchResultSkeleton />
                  </CommandItem>
               ))}
         </CommandGroup>
      )
   } else {
      return (
         <>
            {results.length > 0 && (
               <CommandGroup heading={heading}>
                  {results.map(result => (
                     <SearchResultRow key={result.id} result={result} />
                  ))}
               </CommandGroup>
            )}
            {type === 'playlist' && (
               <CommandGroup heading='Your Playlists'>
                  {playlists.map(result => (
                     <SearchResultOwnedPlaylist key={result.id} result={result} />
                  ))}
               </CommandGroup>
            )}
         </>
      )
   }
}

type SearchResult = SimplifiedAlbum | Artist | SimplifiedPlaylist
const getSearchValue = (searchRow: SearchResult): string => {
   if (searchRow.type === 'album') {
      return searchRow.artists.map(a => a.name).join(' ')
   } else if (searchRow.type === 'playlist') {
      return `${searchRow.owner.display_name ?? searchRow.owner.id}`
   }
   // Other cases are not supported.
   return ''
}

const getSecondaryData = (searchRow: SearchResult): string => {
   if (searchRow.type === 'artist') {
      return `${searchRow.followers.total.toLocaleString()} Followers`
   } else if (searchRow.type === 'album') {
      return searchRow.artists.map(a => a.name).join(', ')
   } else if (searchRow.type === 'playlist') {
      return searchRow.owner.display_name ?? searchRow.owner.id
   }
   // Other cases are not supported.
   return ''
}

const SearchResultRow = ({ result }: { result: SearchResult }) => {
   const findImage = (searchRow: SearchResult, index: number) => {
      return (
         searchRow.images
            ?.map(i => i.url)
            .filter((_, i) => i <= index)
            .at(-1) ?? ''
      )
   }
   const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
   const tileImage = findImage(result, 1)
   const bigImage = findImage(result, 0)
   const type = result.type

   const { open } = useCreateReviewModal({
      entityId: result.id,
      entityImage: bigImage,
      entityName: result.name,
      entityType: capitalizeFirst(type) as EntityType,
   })

   const execute = useExecuteAndClose()

   return (
      <CommandItem onSelect={() => execute(() => open())} value={`${result.name} ${getSearchValue(result)}`}>
         <div className='flex items-center space-x-4'>
            <img className='h-12 w-12 object-cover object-center' src={tileImage} />
            <div className='space-y-2'>
               <div>{result.name}</div>
               <div>{getSecondaryData(result)}</div>
            </div>
         </div>
      </CommandItem>
   )
}

const SearchResultOwnedPlaylist = ({ result }: { result: PlaylistDetailsFragment }) => {
   const image = result.images.at(-1)
   const { open } = useCreateReviewModal({
      entityId: result.id,
      entityImage: result.images.at(-2) ?? image ?? '',
      entityName: result.name,
      entityType: 'Playlist',
   })

   const execute = useExecuteAndClose()

   const displayName = userDisplayNameOrId(result.owner)

   return (
      <CommandItem onSelect={() => execute(() => open())} value={`${result.name} ${displayName}`}>
         <div className='flex items-center space-x-4'>
            <img className='h-12 w-12 object-cover object-center' src={image} />
            <div className='space-y-2'>
               <div>{result.name}</div>
               <div>{displayName}</div>
            </div>
         </div>
      </CommandItem>
   )
}

const SearchResultSkeleton = () => {
   return (
      <div className='flex items-center space-x-4'>
         <Skeleton className='h-12 w-12 rounded' />
         <div className='space-y-2'>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
         </div>
      </div>
   )
}
