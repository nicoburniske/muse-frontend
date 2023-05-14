import {
   ArrowTopRightOnSquareIcon,
   ClipboardDocumentCheckIcon,
   EllipsisVerticalIcon,
   InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { QueryFunction, useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { MuseAvatar } from '@/component/avatar/MuseAvatar'
import { CommandButton } from '@/component/command/Command'
import { MobileNavigation } from '@/component/container/MobileMenu'
import { useSelectReview } from '@/component/SelectedReview'
import { GetFeedQuery, ReviewDetailsFragment, useGetFeedQuery } from '@/graphql/generated/schema'
import { Badge } from '@/lib/component/Badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/lib/component/Card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/component/DropdownMenu'
import { HeroLoading } from '@/lib/component/HeroLoading'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/lib/component/Tooltip'
import useCopyToClipboard from '@/lib/hook/useCopyToClipboard'
import { findFirstImage, nonNullable, userDisplayNameOrId } from '@/util/Utils'

export const HomePage = () => {
   return (
      <div className='flex flex-1 flex-col bg-background'>
         <header className='w-full'>
            <div className='relative flex h-16 flex-shrink-0 items-center border-b p-1 shadow-sm'>
               <MobileNavigation />

               <div className='align-center flex flex-1 justify-center px-4 py-2'>
                  <CommandButton />
               </div>
               <MuseAvatar className='mx-1 flex h-8 w-8 md:hidden' />
            </div>
         </header>

         <main className='min-h-0 ' aria-labelledby='feed-gallery'>
            <FeedResults />
         </main>
      </div>
   )
}

const FeedResults = () => {
   const query = useInfiniteFeedQuery(10, { suspense: true })
   const { hasNextPage, fetchNextPage, isFetchingNextPage } = query

   const feedItems = query.data?.pages.flatMap(page => page.feed?.edges.map(edge => edge.node) ?? []) ?? []

   const parentRef = useRef<HTMLDivElement>(null)
   const parentOffsetRef = useRef(0)

   useLayoutEffect(() => {
      parentOffsetRef.current = parentRef.current?.offsetTop ?? 0
   }, [])

   const rowVirtualizer = useWindowVirtualizer({
      count: hasNextPage ? feedItems.length + 1 : feedItems.length,
      estimateSize: () => 300,
      overscan: 20,
      scrollMargin: parentOffsetRef.current,
   })

   useEffect(() => {
      const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
      if (!lastItem) {
         return
      }
      if (lastItem.index >= feedItems.length - 1 && hasNextPage && !isFetchingNextPage) {
         fetchNextPage()
      }
   }, [hasNextPage, fetchNextPage, feedItems.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()])

   if (query.isLoading && feedItems.length === 0) {
      return (
         <div className='relative h-full w-full'>
            <HeroLoading />
         </div>
      )
   } else {
      return (
         <div ref={parentRef} className='muse-scrollbar h-full w-full overflow-y-auto overflow-x-hidden'>
            <div className='mx-auto w-full max-w-7xl'>
               <div className='flex px-4 pt-8 sm:px-6 lg:px-8'>
                  <h1 className='flex-1 text-2xl font-bold text-foreground'>Home</h1>
               </div>
            </div>
            <div
               className='relative w-full'
               style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
               }}
            >
               <div
                  style={{
                     position: 'absolute',
                     top: 0,
                     left: 0,
                     width: '100%',
                     transform: `translateY(${
                        rowVirtualizer.getVirtualItems()[0].start - rowVirtualizer.options.scrollMargin
                     }px)`,
                  }}
               >
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                     const isLoaderRow = virtualRow.index > feedItems.length - 1
                     const review = feedItems[virtualRow.index]

                     return (
                        <div
                           key={virtualRow.key}
                           data-index={virtualRow.index}
                           ref={rowVirtualizer.measureElement}
                           className='grid w-full place-items-center'
                        >
                           {isLoaderRow ? null : (
                              //  hasNextPage ? (
                              //     <div className={cn('grid place-items-center gap-x-4', colsStyle)}>
                              //        {Array(numCols)
                              //           .fill(0)
                              //           .map((_, i) => (
                              //              <Skeleton key={i} className='h-48 w-3/4 rounded p-4' />
                              //           ))}
                              //     </div>
                              //  )
                              <FeedCard key={virtualRow.key} review={review} />
                           )}
                        </div>
                     )
                  })}
               </div>
            </div>
         </div>
      )
   }
}

const FeedCard = ({ review }: { review: ReviewDetailsFragment }) => {
   const childEntities = review?.childReviews?.map(child => child?.entity).filter(nonNullable) ?? []
   const allEntities = nonNullable(review?.entity) ? [review?.entity, ...childEntities] : childEntities
   const avatar = review.creator.spotifyProfile?.images?.at(-1) ?? ''
   const image = findFirstImage(allEntities, 1)
   const entityName = allEntities.map(e => e.name).find(nonNullable)
   const entityType = allEntities.map(e => e.__typename).find(nonNullable)
   const nav = useNavigate()
   const linkToReviewPage = () => nav(`/app/reviews/${review.id}`)
   const creatorName = userDisplayNameOrId(review.creator)
   const { setSelectedReview } = useSelectReview()
   const { mutate: copy } = useCopyToClipboard({ onSuccess: () => toast.success('Copied to clipboard!') })
   const copyLink = () => copy(`https://muselabs.xyz/app/reviews/${review.id}`)

   const [menuOpen, setMenuOpen] = useState(false)
   const openSelectAndCloseMenu = () => {
      setSelectedReview(review.id, review.creator.id)
      setMenuOpen(false)
   }
   const stopPropAndExecute = (fn: () => void) => (e: Event) => {
      e.stopPropagation()
      e.preventDefault()
      fn()
   }

   return (
      <Card className='h-max-content m-5 w-full max-w-xl'>
         <CardHeader className='space-y-2 p-4 pb-0'>
            <CardTitle className='line-clamp-1 text-clip text-base lg:text-xl'>{review.reviewName}</CardTitle>
            <div className='flex justify-between'>
               <div className='flex items-center gap-4'>
                  <img className='h-11 w-11 rounded-full' src={avatar} />
                  <div className='flex flex-col items-start justify-center'>
                     <Link
                        to={`/app/user/${review.creator.id}`}
                        className='text-card-foreground underline-offset-4 hover:underline'
                     >
                        {creatorName}
                     </Link>

                     <p className='text-sm text-muted-foreground'>{new Date(review.createdAt).toDateString()}</p>
                  </div>
               </div>
               <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger>
                     <span>
                        <TooltipProvider delayDuration={100}>
                           <Tooltip>
                              <TooltipTrigger className='p-2'>
                                 <EllipsisVerticalIcon className='h-6 w-6' aria-hidden='true' />
                              </TooltipTrigger>
                              <TooltipContent>More details</TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                     </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem onSelect={stopPropAndExecute(linkToReviewPage)}>
                        <ArrowTopRightOnSquareIcon className='mr-4 h-5 w-5' />
                        Open Review
                     </DropdownMenuItem>
                     <DropdownMenuItem onSelect={stopPropAndExecute(copyLink)}>
                        <ClipboardDocumentCheckIcon className='mr-4 h-5 w-5' />
                        Copy Link
                     </DropdownMenuItem>

                     <DropdownMenuItem onSelect={stopPropAndExecute(openSelectAndCloseMenu)}>
                        <InformationCircleIcon className='mr-4 h-5 w-5' />
                        <span>View Details</span>
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </CardHeader>
         <CardContent onClick={linkToReviewPage}>
            <img className='mx-auto mt-2 border object-cover object-center' src={image} />
         </CardContent>
         <CardFooter className='flex-col items-start space-y-1 p-4 pt-0'>
            <div className='flex w-full justify-between'>
               <div className='flex items-center gap-1'>
                  <Badge variant='outline'>{entityType}</Badge>
                  <CardDescription className='line-clamp-1'>{entityName}</CardDescription>
               </div>
            </div>
         </CardFooter>
      </Card>
   )
}

const useInfiniteFeedQuery = (
   pageSize: number,
   options: UseInfiniteQueryOptions<GetFeedQuery, unknown, GetFeedQuery, GetFeedQuery, any[]>
) => {
   const pageQuery: QueryFunction<GetFeedQuery, readonly any[]> = ({ pageParam }) => {
      return useGetFeedQuery.fetcher({ first: pageSize, after: pageParam })()
   }

   return useInfiniteQuery(['Feed', pageSize], pageQuery, {
      getNextPageParam: lastPage => {
         const maybeEndCursor = lastPage?.feed?.pageInfo.endCursor
         const maybeNextPage = lastPage?.feed?.pageInfo.hasNextPage
         if (maybeEndCursor && maybeNextPage) {
            return maybeEndCursor
         } else {
            return false
         }
      },
      ...options,
   })
}
