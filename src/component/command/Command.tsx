import {
   ArrowLeftOnRectangleIcon,
   ChatBubbleLeftRightIcon,
   CheckIcon,
   ListBulletIcon,
   MusicalNoteIcon,
   PlusIcon,
} from '@heroicons/react/24/outline'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Dispatch, SetStateAction, useCallback, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'
import { Artist, SearchType, SimplifiedAlbum, SimplifiedPlaylist } from 'spotify-web-api-ts/types/types/SpotifyObjects'

import { NAV, NavItem } from '@/component/container/NavConstants'
import { CreateReviewModal, useCreateReviewModal } from '@/component/createReview/CreateReviewModal'
import { useSpotifyIcon } from '@/component/ListenOnSpotify'
import { useSearchSpotify } from '@/component/sdk/ClientHooks'
import { useResetSpotifySdk } from '@/component/sdk/PlaybackSDK'
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
   CommandShortcut,
} from '@/lib/component/Command'
import { Skeleton } from '@/lib/component/Skeleton'
import { useTransientAtom } from '@/lib/hook/useTransientAtom'
import { useCurrentUserId } from '@/state/CurrentUser'
import { useLogoutMutation } from '@/state/useLogoutMutation'
import { Themes, useTheme } from '@/state/UserPreferences'
import { allEntities, cn, getReviewOverviewImage, userDisplayNameOrId } from '@/util/Utils'

const openAtom = atom(false)

const searchAtom = atomWithDebounce('')
const useCurrentSearch = (): [string, Dispatch<SetStateAction<string>>] => [
   useAtomValue(searchAtom.currentValueAtom),
   useSetAtom(searchAtom.debouncedValueAtom),
]

export const Pages = {
   createReview: 'Create Review',
   searchReviews: 'Search Reviews',
   searchPlaylists: 'Search Playlists',
   createAlbumReview: 'Create Album Review',
   createPlaylistReview: 'Create Playlist Review',
} as const
export type Page = (typeof Pages)[keyof typeof Pages]

export const pagesAtom = atom<string[]>([])
const setPageAndClearAtom = atom(null, (_get, set, page: Page) => {
   set(pagesAtom, pages => [...pages, page])
   set(searchAtom.debouncedValueAtom, '')
})

const setPageAndOpenAtom = atom(null, (_get, set, page: Page) => {
   set(setPageAndClearAtom, page)
   set(openAtom, true)
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
      // unique identifer with search properties.
      id: string
      // menu string
      label: string
      onSelect: () => void
      icon?: (props: React.ComponentProps<'svg'>) => JSX.Element
      shortcut?: {
         key: string
         modifier: string
      }
   }[]
}

const extraCommandGroupsAtom = atom<CommandGroup[]>([])

/**
 * External hooks.
 */

export const useSetExtraCommandGroups = (pages: CommandGroup[]) => {
   const setExtraCommandGroups = useSetAtom(extraCommandGroupsAtom)
   useEffect(() => {
      setExtraCommandGroups(pages)
      return () => setExtraCommandGroups([])
   }, [pages])
}

export const useOpenCommandPage = () => {
   const setPageAndOpen = useSetAtom(setPageAndOpenAtom)
   return useCallback((page: Page) => setPageAndOpen(page), [setPageAndOpen])
}

export const useExecuteAndClose = () => {
   const setOpen = useSetAtom(openAtom)
   return useCallback(
      (func: () => void) => () => {
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
            'muse-cmd',
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
   const [open, setOpen] = useAtom(openAtom)
   const [search, setSearch] = useCurrentSearch()
   const setPages = useSetAtom(pagesAtom)
   const page = useAtomValue(currentPageAtom)

   const executeAndClose = useExecuteAndClose()

   useHotkeys(
      ['meta+k', 'ctrl+k'],
      useCallback(() => setOpen(true), [setOpen]),
      {
         preventDefault: true,
      },
      [setOpen]
   )

   const setPageAndClear = useSetAtom(setPageAndClearAtom)

   const extraGroups = useAtomValue(extraCommandGroupsAtom)

   const isCreateReview = page === Pages.createAlbumReview || page === Pages.createPlaylistReview
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
               {!page && (
                  <>
                     <CommandEmpty>No results found.</CommandEmpty>
                     {extraGroups.map(g => (
                        <>
                           <CommandGroup key={g.header} heading={g.header}>
                              {g.items.map(item => {
                                 const { id, label, onSelect, shortcut, icon } = item
                                 return (
                                    <CommandItem key={id} onSelect={onSelect} value={id}>
                                       {icon === undefined ? null : <item.icon className='mr-2 h-4 w-4' />}
                                       {label}

                                       {shortcut && (
                                          <CommandShortcut>
                                             {shortcut.modifier}
                                             {shortcut.key}
                                          </CommandShortcut>
                                       )}
                                    </CommandItem>
                                 )
                              })}
                           </CommandGroup>
                           <CommandSeparator />
                        </>
                     ))}

                     <CommandGroup heading='Suggestions'>
                        <CommandItem onSelect={() => setPageAndClear(Pages.createReview)}>
                           <PlusIcon className='mr-2 h-4 w-4' />
                           Create a review
                        </CommandItem>
                        <CommandItem onSelect={() => setPageAndClear(Pages.searchReviews)}>
                           <ChatBubbleLeftRightIcon className='mr-2 h-4 w-4' />
                           Search your reviews…
                        </CommandItem>
                        <CommandItem onSelect={() => setPageAndClear(Pages.searchPlaylists)}>
                           <MusicalNoteIcon className='mr-2 h-4 w-4' />
                           Search your playlists...
                        </CommandItem>
                     </CommandGroup>
                     <CommandSeparator />
                     <CommandGroup heading='Pages'>
                        {NAV.map(item => (
                           <CommandNavItem key={item.href} nav={item} />
                        ))}
                     </CommandGroup>
                     <CommandSeparator />
                     <SessionGroup />
                     <CommandSeparator />
                     <ThemeGroup />
                  </>
               )}

               <CommandSeparator />

               {page === Pages.createReview && (
                  <CommandGroup heading='Select Review Type'>
                     <CommandItem onSelect={() => setPageAndClear(Pages.createAlbumReview)}>
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
                     <CommandItem onSelect={() => setPageAndClear(Pages.createPlaylistReview)}>
                        <ListBulletIcon className='mr-2 h-4 w-4' />
                        Create Playlist Review
                     </CommandItem>
                  </CommandGroup>
               )}
               {isCreateReview && <CreateReviewGroup />}
               {(page === Pages.searchReviews || (search.length > 0 && !page)) && <ReviewGroup />}
               {(page === Pages.searchPlaylists || (search.length > 0 && !page)) && <PlaylistGroup />}
               <CommandSeparator />
            </CommandList>
         </CommandDialog>
         <CreateReviewModal />
      </>
   )
}

const SessionGroup = () => {
   const execute = useExecuteAndClose()

   const { mutate } = useLogoutMutation()
   const logout = () => mutate(undefined)
   const spotifyIcon = useSpotifyIcon()
   const resetSdk = useResetSpotifySdk()

   return (
      <CommandGroup heading='Session'>
         <CommandItem onSelect={logout}>
            <ArrowLeftOnRectangleIcon className='mr-2 h-4 w-4' />
            Logout
         </CommandItem>
         <CommandItem onSelect={execute(resetSdk)}>
            <img className='mr-2 h-4 w-4' src={spotifyIcon} alt='Spotify Logo' />
            Reset Player
         </CommandItem>
      </CommandGroup>
   )
}

const CommandNavItem = ({ nav }: { nav: NavItem }) => {
   const action = nav.action()
   const wrapper = useExecuteAndClose()

   return (
      <CommandItem onSelect={wrapper(action)} value={`${nav.name} Page Nav`}>
         <nav.icon className='mr-2 h-4 w-4' />
         {nav.name}
      </CommandItem>
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

   return (
      <CommandGroup heading='Your Reviews'>
         {reviews.map(r => {
            const displayName = userDisplayNameOrId(r.creator)
            const entities = allEntities(r)
               .map(e => e?.name)
               .join(' ')
            return (
               <CommandItem
                  key={r.id}
                  onSelect={executeAndClose(navToReview(r.id))}
                  value={`${r.reviewName} ${displayName} ${entities} ${r.id}`}
               >
                  <div className='flex w-full items-center justify-between'>
                     <div className='flex items-center gap-4'>
                        <img src={getReviewOverviewImage(r, 1)} className='h-12 w-12 object-cover object-center' />
                        <span>{r.reviewName}</span>
                     </div>
                     <span>{displayName}</span>
                  </div>
               </CommandItem>
            )
         })}
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
                    onSelect={executeAndClose(navToPlaylist(p.id))}
                    value={`${p.name}-${userDisplayNameOrId(p.owner)} ${p.id}`}
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

   const searchConfig = (() => {
      if (query.length > 0) {
         return {
            type: [type],
            limit: 40,
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
            <CommandEmpty>No Search Results.</CommandEmpty>
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

   const { openCreateReview } = useCreateReviewModal()
   const open = () =>
      openCreateReview({
         entityId: result.id,
         entityImage: bigImage,
         entityName: result.name,
         entityType: capitalizeFirst(type) as EntityType,
      })

   const execute = useExecuteAndClose()

   return (
      <CommandItem onSelect={execute(open)} value={`${result.name} ${getSearchValue(result)} ${result.id}`}>
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
   const { openCreateReview } = useCreateReviewModal()
   const open = () => {
      openCreateReview({
         entityId: result.id,
         entityImage: result.images.at(-2) ?? image ?? '',
         entityName: result.name,
         entityType: 'Playlist',
      })
   }

   const execute = useExecuteAndClose()

   const displayName = userDisplayNameOrId(result.owner)

   return (
      <CommandItem onSelect={execute(open)} value={`${result.name} ${displayName} ${result.id}`}>
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
