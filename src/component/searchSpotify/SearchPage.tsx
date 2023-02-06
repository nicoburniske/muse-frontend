import {
   BackspaceIcon,
   ChartBarIcon,
   InformationCircleIcon,
   MagnifyingGlassIcon,
   UserIcon,
} from '@heroicons/react/20/solid'
import { QueryFunction, UseInfiniteQueryOptions, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSpotifyClient } from 'component/sdk/ClientAtoms'
import { SearchConfig, useAvailableGenreSeeds } from 'component/sdk/ClientHooks'
import {
   CreateReviewMutationVariables,
   EntityType,
   useCreateReviewMutation,
   useProfileAndReviewsQuery,
} from 'graphql/generated/schema'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import atomWithDebounce from 'platform/atom/atomWithDebounce'
import { HeroLoading } from 'platform/component/HeroLoading'
import { useEffect, useMemo, useRef, memo, ReactNode, useState } from 'react'
import {
   Artist,
   SearchType,
   SimplifiedAlbum,
   SimplifiedEpisode,
   SimplifiedPlaylist,
   SimplifiedShow,
   Track,
} from 'spotify-web-api-ts/types/types/SpotifyObjects'
import { SearchResponse } from 'spotify-web-api-ts/types/types/SpotifyResponses'
import { classNames, nonNullable, uniqueByProperty } from 'util/Utils'
import { ToggleWithDescription } from 'platform/component/ToggleWithDescription'
import SelectMany from 'platform/component/SelectMany'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Portal } from '@headlessui/react'
import { ThemeModal } from 'platform/component/ThemeModal'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SearchPage = () => {
   return (
      <>
         <div className='flex h-full w-full'>
            <div className='flex w-56 flex-col space-y-5 bg-base-200 p-4'>
               <SelectEntityTypes />
               <SelectGenreSeeds />
               <SelectHipsterFilter />
               <SelectNewFilter />
            </div>
            <div className='flex grow flex-col items-center justify-between bg-base-100'>
               <div className='w-full max-w-3xl'>
                  <SearchInputBar />
               </div>

               <div className='flex h-full w-full px-3'>
                  <div className='max-h-full grow rounded-md border-2 border-base-200 shadow-2xl'>
                     <ScrollSearchResults />
                  </div>
               </div>
            </div>
         </div>

         <CreateReviewModal />
      </>
   )
}

const selectedEntityTypesAtom = atom(new Array<EntityType>())
const selectedGenreSeedsAtom = atom(new Array<string>())
const filterHipsterAtom = atom(false)
const filterNewAtom = atom(false)
// TODO: Handle URI getting pasted in?
const { currentValueAtom: queryStringAtom, debouncedValueAtom: debouncedQueryString } = atomWithDebounce('')

// Hipster only applies to albums?
const SelectHipsterFilter = () => {
   const [hipster, setHipster] = useAtom(filterHipsterAtom)

   const onChange = (value: boolean) => {
      setHipster(value)
   }

   return (
      <ToggleWithDescription
         label={'Hipster'}
         description={'10% Least Popular'}
         enabled={hipster}
         setEnabled={onChange}
      />
   )
}

// Only for albums.
const SelectNewFilter = () => {
   const [newOnly, setNewOnly] = useAtom(filterNewAtom)
   const setEntityTypes = useSetAtom(selectedEntityTypesAtom)

   const onChange = (value: boolean) => {
      setNewOnly(value)
      setEntityTypes(current => (value ? [EntityType.Album] : current))
   }

   return (
      <ToggleWithDescription
         label='New'
         description='Released In Last 2 Weeks'
         enabled={newOnly}
         setEnabled={onChange}
      />
   )
}

const SearchInputBar = () => {
   const search = useAtomValue(queryStringAtom)
   const setSearch = useSetAtom(debouncedQueryString)
   return (
      <div className='flex py-1'>
         <form className='flex w-full md:ml-0'>
            <label htmlFor='search-field' className='sr-only'>
               Search reviews
            </label>
            <div className='flex w-full flex-row items-center justify-between space-x-5 text-base-content'>
               <MagnifyingGlassIcon className='h-5 w-5 flex-shrink-0' aria-hidden='true' />
               <input
                  name='search-field'
                  id='search-field'
                  className='input w-full border-2 border-base-content/20 text-base placeholder-base-content/50 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm'
                  placeholder='Search'
                  value={search}
                  type='search'
                  autoComplete='off'
                  onChange={e => setSearch(e.target.value as string)}
               />
            </div>
         </form>
      </div>
   )
}

export default SearchPage

const renderString = (selected: string[]) => (selected.length > 0 ? selected.join(', ') : 'None')
const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const SelectEntityTypes = () => {
   const [selected, setSelectedEntityTypes] = useAtom(selectedEntityTypesAtom)
   const clear = () => setSelectedEntityTypes([])
   return (
      <div className='flex flex-col items-center space-y-2'>
         <div className='w-full'>
            <SelectMany
               label={'Search Types'}
               selected={selected}
               allOptions={Object.values(EntityType)}
               onChange={setSelectedEntityTypes}
               createKey={(e: EntityType) => e}
               renderOption={(e: EntityType) => e}
               renderSelected={renderString}
            />
         </div>
         <button className='btn btn-md w-32 gap-2' onClick={clear} disabled={selected.length === 0}>
            <span className='hidden md:block'>Clear</span>
            <BackspaceIcon className='h-6 w-6' />
         </button>
      </div>
   )
}

const SelectGenreSeeds = () => {
   const [selected, setSelected] = useAtom(selectedGenreSeedsAtom)
   const clear = () => setSelected([])
   const { data } = useAvailableGenreSeeds({ staleTime: 5 * 60 * 1000 })
   return (
      <div className='flex flex-col items-center space-y-2'>
         <div className='w-full'>
            <SelectMany
               label={'Genres'}
               selected={selected}
               allOptions={data ?? []}
               onChange={setSelected}
               createKey={(s: string) => s}
               renderOption={capitalizeFirst}
               renderSelected={(selected: string[]) =>
                  selected.length > 0 ? selected.map(capitalizeFirst).join(', ') : 'None'
               }
            />
         </div>
         <button className='btn btn-md w-32 gap-2' onClick={clear} disabled={selected.length === 0}>
            <span className='hidden md:block'>Clear</span>
            <BackspaceIcon className='h-6 w-6' />
         </button>
      </div>
   )
}

const searchConfigAtom = atom(get => {
   const type = get(selectedEntityTypesAtom).map(e => e.toLowerCase() as SearchType)
   const genre = get(selectedGenreSeedsAtom)
   const query = get(debouncedQueryString)
   const filterHipster = get(filterHipsterAtom)
   const filterNew = get(filterNewAtom)

   const withFilters = classNames(
      query,
      genre.length > 0 ? `"genre":${genre.join(' ')}` : undefined,
      filterHipster ? 'tag:hipster' : undefined,
      filterNew ? 'tag:new' : undefined
   )

   if (type.length === 0 || withFilters.length === 0) {
      return null
   } else {
      return { type, query: withFilters }
   }
})

type SearchResults = {
   albums: SimplifiedAlbum[]
   artists: Artist[]
   episodes: SimplifiedEpisode[]
   playlists: SimplifiedPlaylist[]
   shows: SimplifiedShow[]
   tracks: Track[]
}

const ScrollSearchResults = () => {
   const searchConfig = useAtomValue(searchConfigAtom)
   const isDisabled = searchConfig === null

   const { isLoading, data, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteSearch(
      searchConfig!,
      20,
      { enabled: !isDisabled, retry: false }
   )

   const response = data?.pages ?? []

   const results = useMemo(
      () =>
         ({
            albums: response.flatMap(r => r.albums?.items ?? []),
            artists: response.flatMap(r => r.artists?.items ?? []),
            episodes: response.flatMap(r => r.episodes?.items ?? []),
            playlists: response.flatMap(r => r.playlists?.items ?? []),
            shows: response.flatMap(r => r.shows?.items ?? []),
            tracks: response.flatMap(r => r.tracks?.items ?? []),
         } as SearchResults),
      [response]
   )
   const allRows = useMemo(() => {
      const validResults = Object.values(results)
         .flat()
         .filter(r => nonNullable(r?.href ?? r?.id))
         .filter(r => nonNullable(r.type))
      return uniqueByProperty(validResults, r => r?.href ?? r?.id)
   }, [results])

   const parentRef = useRef<HTMLDivElement>(null)
   const rowVirtualizer = useVirtualizer({
      count: hasNextPage ? allRows.length + 1 : allRows.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 130,
      overscan: 20,
   })

   // Fetch next page on bottom.
   useEffect(() => {
      const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
      if (!lastItem) {
         return
      }
      if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
         fetchNextPage()
      }
   }, [hasNextPage, fetchNextPage, allRows.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()])

   if (isDisabled) {
      return null
   } else if (isLoading && response.length === 0) {
      return (
         <div className='relative h-full w-full'>
            <HeroLoading />
         </div>
      )
   } else {
      return (
         <div ref={parentRef} className='h-full w-full overflow-y-auto px-1'>
            <div
               className='relative w-full'
               style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
               }}
            >
               {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const isLoaderRow = virtualRow.index > allRows.length - 1
                  const searchRow = allRows[virtualRow.index]

                  return (
                     <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                           position: 'absolute',
                           top: 0,
                           left: 0,
                           width: '100%',
                           height: `${virtualRow.size}px`,
                           transform: `translateY(${virtualRow.start}px)`,
                        }}
                     >
                        {isLoaderRow ? (
                           hasNextPage ? (
                              'Loading more...'
                           ) : (
                              'Nothing more to load'
                           )
                        ) : (
                           <MemoResultRow searchRow={searchRow} />
                        )}
                     </div>
                  )
               })}
            </div>
         </div>
      )
   }
}

type SearchRow = SimplifiedAlbum | Artist | SimplifiedEpisode | SimplifiedPlaylist | SimplifiedShow | Track
const SearchResultRow = ({ searchRow }: { searchRow: SearchRow }) => {
   const image = searchRow?.images?.at(0)?.url ?? searchRow?.album?.images?.at(-2)?.url
   const type = searchRow.type

   const { open } = useCreateReviewModal({
      entityId: searchRow.id,
      entityImage: image,
      entityName: searchRow.name,
      entityType: capitalizeFirst(type) as EntityType,
   })

   return (
      <div className='block rounded-md text-base-content hover:bg-base-200 hover:delay-100'>
         <div className='flex items-center px-4 py-3 sm:px-6'>
            <div className='flex min-w-0 flex-1 items-center'>
               <div className='flex-shrink-0'>
                  <img className='h-24 w-24 rounded-md' src={image} alt='' />
               </div>
               <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4'>
                  <div>
                     <p className='truncate text-lg font-bold'>{searchRow.name}</p>
                     <p className='mt-2 flex items-center text-base font-normal'>
                        <InformationCircleIcon
                           className='mr-1.5 h-5 w-5 flex-shrink-0 font-light text-primary'
                           aria-hidden='true'
                        />
                        <span className='truncate'>{capitalizeFirst(type)}</span>
                     </p>
                  </div>
                  <div className='hidden md:block'>{secondaryData(searchRow)}</div>
               </div>
            </div>
            <div>
               <button type='button' className='btn btn-primary' onClick={() => open()}>
                  <PlusIcon className='h-5 w-5' aria-hidden='true' />
               </button>
            </div>
         </div>
      </div>
   )
}

const secondaryData = (searchRow: SearchRow): ReactNode => {
   if (searchRow.type === 'artist') {
      return (
         <>
            <p className='flex items-center text-base'>
               <ChartBarIcon className='mr-1.5 h-5 w-5 flex-shrink-0 text-secondary' aria-hidden='true' />
               Total Followers
            </p>
            <p className='mt-2 flex items-center text-base'>{searchRow.followers.total.toLocaleString()}</p>
         </>
      )
   } else if (searchRow.type === 'album') {
      return (
         <>
            <p className='flex items-center text-base'>
               <UserIcon className='mr-1.5 h-5 w-5 flex-shrink-0 text-secondary' aria-hidden='true' />
               Artist
            </p>
            <p className='mt-2 flex items-center text-base'>
               {searchRow.artists.map(artist => artist.name).join(', ')}
            </p>
         </>
      )
   } else if (searchRow.type === 'track') {
      ;<>
         <p className='flex items-center text-base'>
            <UserIcon className='mr-1.5 h-5 w-5 flex-shrink-0 text-secondary' aria-hidden='true' />
            Artist
         </p>
         <p className='mt-2 flex items-center text-base'>{searchRow.artists.map(artist => artist.name).join(', ')}</p>
      </>
   } else if (searchRow.type === 'playlist') {
      ;<>
         <p className='flex items-center text-base'>
            <UserIcon className='mr-1.5 h-5 w-5 flex-shrink-0 text-secondary' aria-hidden='true' />
            Owner
         </p>
         <p className='mt-2 flex items-center text-base'>{`@${searchRow.owner.id}`}</p>
      </>
   }
   // Other cases are not supported.
   return null
}

const MemoResultRow = memo(
   SearchResultRow,
   (prevProps, nextProps) => prevProps.searchRow.href === nextProps.searchRow.href
)

export const useInfiniteSearch = (
   search: SearchConfig,
   limit: number,
   options: UseInfiniteQueryOptions<SearchResponse, unknown, SearchResponse>
) => {
   const { query, type, options: searchOptions } = search ?? {}

   const client = useSpotifyClient()

   const pageQuery: QueryFunction<SearchResponse, readonly unknown[]> = ({ pageParam }) => {
      return client.search.search(query, type, { ...searchOptions, limit, offset: pageParam })
   }

   return useInfiniteQuery<SearchResponse, unknown, SearchResponse>(
      ['SpotifySearch', query, type, searchOptions],
      pageQuery,
      {
         getNextPageParam: (lastPage, pages) => {
            if (
               lastPage.albums?.next ||
               lastPage.artists?.next ||
               lastPage.episodes?.next ||
               lastPage.playlists?.next ||
               lastPage.shows?.next ||
               lastPage.tracks?.next
            ) {
               return pages.length * limit
            }
            return false
         },
         ...options,
      }
   )
}

type CreateReviewProps = {
   entityId: string
   entityType: EntityType
   entityName: string
   entityImage: string
}

const createReviewAtom = atom<CreateReviewProps | undefined>(undefined)
const createReviewModalOpenAtom = atom(false)
const openModalAtom = atom(null, (_get, set, create: CreateReviewProps) => {
   set(createReviewModalOpenAtom, true)
   set(createReviewAtom, create)
})
const closeModalAtom = atom(null, (_get, set) => {
   set(createReviewModalOpenAtom, false)
   setTimeout(() => set(createReviewAtom, undefined), 500)
})
const useCreateReviewModal = (create: CreateReviewProps) => {
   const setOpen = useSetAtom(openModalAtom)
   return {
      open: () => setOpen(create),
      close: useSetAtom(closeModalAtom),
   }
}

const CreateReviewModal = () => {
   const isModalOpen = useAtomValue(createReviewModalOpenAtom)
   const close = useSetAtom(closeModalAtom)

   const nav = useNavigate()
   const queryClient = useQueryClient()
   const resetReviewOverviews = () => queryClient.invalidateQueries(useProfileAndReviewsQuery.getKey())

   const { entityId, entityType, entityName, entityImage } = useAtomValue(createReviewAtom) ?? {}

   const { isLoading, mutate } = useCreateReviewMutation({
      onError: () => toast.error(`Failed to create ${entityType} review.`),
      onSuccess: data => {
         close()
         toast.success(`Successfully created ${entityType} review.`)
         resetReviewOverviews()
         const id = data?.createReview?.id
         if (id) {
            nav(`/app/reviews/${id}`)
         }
      },
   })

   const [name, setName] = useState('')
   const [isPublic, setIsPublic] = useState(false)

   const entity = entityId !== undefined ? { entityId, entityType } : undefined
   const input = { isPublic: isPublic ? true : false, name, entity }
   const createReviewMutation = () => mutate({ input } as CreateReviewMutationVariables)

   const createDisabled = name.length === 0 || isLoading

   return (
      <Portal>
         <ThemeModal open={isModalOpen} className='max-w-md border-0 bg-transparent lg:max-w-2xl'>
            <div className='card bg-base-100 shadow-xl lg:card-side'>
               <figure>
                  <img src={entityImage} alt='ReviewEntityImage' className='h-96 w-96' />
               </figure>
               <div className='card-body justify-between'>
                  <h2 className='card-title w-full text-center'>
                     {entityName}
                     <div className='badge badge-secondary'>{entityType}</div>
                  </h2>
                  <div>
                     <label className='block text-base font-bold text-base-content'>Review Name</label>
                     <div className='mt-1'>
                        <input
                           type='text'
                           placeholder='Type here'
                           className='input w-full max-w-md'
                           onChange={e => setName(e.target.value)}
                        />
                     </div>
                  </div>
                  <ToggleWithDescription
                     label='Is Public'
                     description='If this review is public, it will be viewable by other users.'
                     enabled={isPublic}
                     setEnabled={setIsPublic}
                  />
                  <div className='card-actions justify-end'>
                     <div className='mt-5 flex w-full flex-row items-center justify-around'>
                        <button
                           type='button'
                           disabled={isLoading}
                           onClick={() => close()}
                           className={classNames('btn btn-primary btn-md', isLoading && 'btn-loading')}
                        >
                           Cancel
                        </button>

                        <button
                           type='button'
                           disabled={createDisabled}
                           onClick={createReviewMutation}
                           className={classNames('btn btn-success btn-md', isLoading && 'btn-loading')}
                        >
                           Create
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </ThemeModal>
      </Portal>
   )
}
