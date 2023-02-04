import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
   ID: string
   String: string
   Boolean: boolean
   Int: number
   Float: number
   Instant: string
   Long: number
}

export enum AccessLevel {
   Collaborator = 'Collaborator',
   Viewer = 'Viewer',
}

export type Album = ReviewEntity & {
   __typename?: 'Album'
   albumGroup?: Maybe<Scalars['String']>
   albumType: Scalars['String']
   artists?: Maybe<Array<Artist>>
   externalUrls: Array<KvStringString>
   genres: Array<Scalars['String']>
   id: Scalars['String']
   images: Array<Scalars['String']>
   label?: Maybe<Scalars['String']>
   name: Scalars['String']
   popularity?: Maybe<Scalars['Int']>
   releaseDate: Scalars['String']
   tracks?: Maybe<Array<Track>>
   uri: Scalars['String']
}

export type Artist = ReviewEntity & {
   __typename?: 'Artist'
   albums?: Maybe<Array<Album>>
   externalUrls: Array<KvStringString>
   genres?: Maybe<Array<Scalars['String']>>
   href: Scalars['String']
   id: Scalars['String']
   images?: Maybe<Array<Scalars['String']>>
   name: Scalars['String']
   numFollowers?: Maybe<Scalars['Int']>
   popularity?: Maybe<Scalars['Int']>
   topTracks?: Maybe<Array<Track>>
   uri: Scalars['String']
}

export type AudioFeatures = {
   __typename?: 'AudioFeatures'
   acousticness: Scalars['Float']
   analysisUrl: Scalars['String']
   danceability: Scalars['Float']
   durationMs: Scalars['Int']
   energy: Scalars['Float']
   id: Scalars['String']
   instrumentalness: Scalars['Float']
   key: Scalars['Int']
   liveness: Scalars['Float']
   loudness: Scalars['Float']
   mode: Scalars['Int']
   speechiness: Scalars['Float']
   tempo: Scalars['Float']
   timeSignature: Scalars['Int']
   trackHref: Scalars['String']
   type: Scalars['String']
   uri: Scalars['String']
   valence: Scalars['Float']
}

export type Collaborator = {
   __typename?: 'Collaborator'
   accessLevel: AccessLevel
   review?: Maybe<Review>
   user: User
}

export type Comment = {
   __typename?: 'Comment'
   comment?: Maybe<Scalars['String']>
   commentIndex: Scalars['Int']
   commenter: User
   createdAt: Scalars['Instant']
   entities?: Maybe<Array<ReviewEntity>>
   id: Scalars['Int']
   parentCommentId?: Maybe<Scalars['Int']>
   reviewId: Scalars['ID']
   updatedAt: Scalars['Instant']
}

export type ContextInput = {
   entityId: Scalars['String']
   entityType: EntityType
}

export type CreateCommentInput = {
   comment: Scalars['String']
   commentIndex?: InputMaybe<Scalars['Int']>
   entities: Array<ReviewEntityInput>
   parentCommentId?: InputMaybe<Scalars['Int']>
   reviewId: Scalars['ID']
}

export type CreateReviewInput = {
   entity?: InputMaybe<ReviewEntityInput>
   isPublic: Scalars['Boolean']
   link?: InputMaybe<InitialLinkInput>
   name: Scalars['String']
}

export type CreatedComment = {
   __typename?: 'CreatedComment'
   comment: Comment
}

export type DeleteCommentInput = {
   commentId: Scalars['Int']
   reviewId: Scalars['ID']
}

export type DeleteReviewInput = {
   id: Scalars['ID']
}

export type DeleteReviewLinkInput = {
   childReviewId: Scalars['ID']
   parentReviewId: Scalars['ID']
}

export type DeletedComment = {
   __typename?: 'DeletedComment'
   commentId: Scalars['Int']
   reviewId: Scalars['ID']
}

export type EntityOffsetInput = {
   inner: ContextInput
   outer: ContextInput
}

export enum EntityType {
   Album = 'Album',
   Artist = 'Artist',
   Playlist = 'Playlist',
   Track = 'Track',
}

export type GetPlaylistTracksInput = {
   numTracks: Scalars['Int']
   playlistId: Scalars['String']
}

export type InitialLinkInput = {
   parentReviewId: Scalars['ID']
}

/** A key-value pair of String and String */
export type KvStringString = {
   __typename?: 'KVStringString'
   /** Key */
   key: Scalars['String']
   /** Value */
   value: Scalars['String']
}

export type LinkReviewsInput = {
   childReviewId: Scalars['ID']
   linkIndex?: InputMaybe<Scalars['Int']>
   parentReviewId: Scalars['ID']
}

export type Mutations = {
   __typename?: 'Mutations'
   createComment?: Maybe<Comment>
   createReview?: Maybe<Review>
   deleteComment?: Maybe<Scalars['Boolean']>
   deleteReview?: Maybe<Scalars['Boolean']>
   deleteReviewLink?: Maybe<Scalars['Boolean']>
   linkReviews?: Maybe<Scalars['Boolean']>
   pausePlayback?: Maybe<Scalars['Boolean']>
   play?: Maybe<Scalars['Boolean']>
   playEntityContext?: Maybe<Scalars['Boolean']>
   playOffsetContext?: Maybe<Scalars['Boolean']>
   playTracks?: Maybe<Scalars['Boolean']>
   removeSavedTracks?: Maybe<Scalars['Boolean']>
   saveTracks?: Maybe<Scalars['Boolean']>
   seekPlayback?: Maybe<Scalars['Boolean']>
   shareReview?: Maybe<Scalars['Boolean']>
   skipToNext?: Maybe<Scalars['Boolean']>
   skipToPrevious?: Maybe<Scalars['Boolean']>
   toggleShuffle?: Maybe<Scalars['Boolean']>
   transferPlayback?: Maybe<Scalars['Boolean']>
   updateComment?: Maybe<Comment>
   updateReview?: Maybe<Review>
   updateReviewEntity?: Maybe<Review>
   updateReviewLink?: Maybe<Scalars['Boolean']>
}

export type MutationsCreateCommentArgs = {
   input: CreateCommentInput
}

export type MutationsCreateReviewArgs = {
   input: CreateReviewInput
}

export type MutationsDeleteCommentArgs = {
   input: DeleteCommentInput
}

export type MutationsDeleteReviewArgs = {
   input: DeleteReviewInput
}

export type MutationsDeleteReviewLinkArgs = {
   input: DeleteReviewLinkInput
}

export type MutationsLinkReviewsArgs = {
   input: LinkReviewsInput
}

export type MutationsPausePlaybackArgs = {
   deviceId?: InputMaybe<Scalars['String']>
}

export type MutationsPlayArgs = {
   input: PlayInput
}

export type MutationsPlayEntityContextArgs = {
   input: PlayEntityContextInput
}

export type MutationsPlayOffsetContextArgs = {
   input: PlayOffsetContextInput
}

export type MutationsPlayTracksArgs = {
   input: PlayTracksInput
}

export type MutationsRemoveSavedTracksArgs = {
   input: Array<Scalars['String']>
}

export type MutationsSaveTracksArgs = {
   input: Array<Scalars['String']>
}

export type MutationsSeekPlaybackArgs = {
   input: SeekPlaybackInput
}

export type MutationsShareReviewArgs = {
   input: ShareReviewInput
}

export type MutationsSkipToNextArgs = {
   deviceId?: InputMaybe<Scalars['String']>
}

export type MutationsSkipToPreviousArgs = {
   deviceId?: InputMaybe<Scalars['String']>
}

export type MutationsToggleShuffleArgs = {
   input: Scalars['Boolean']
}

export type MutationsTransferPlaybackArgs = {
   input: TransferPlaybackInput
}

export type MutationsUpdateCommentArgs = {
   input: UpdateCommentInput
}

export type MutationsUpdateReviewArgs = {
   input: UpdateReviewInput
}

export type MutationsUpdateReviewEntityArgs = {
   input: UpdateReviewEntityInput
}

export type MutationsUpdateReviewLinkArgs = {
   input: UpdateReviewLinkInput
}

export type PaginationInput = {
   first: Scalars['Int']
   offset?: Scalars['Int']
}

export type PaginationResultAlbum = {
   __typename?: 'PaginationResultAlbum'
   items: Array<Album>
   itemsLeft: Scalars['Int']
   limit: Scalars['Int']
   nextOffset?: Maybe<Scalars['Int']>
}

export type PaginationResultArtist = {
   __typename?: 'PaginationResultArtist'
   items: Array<Artist>
   itemsLeft: Scalars['Int']
   limit: Scalars['Int']
   nextOffset?: Maybe<Scalars['Int']>
}

export type PaginationResultPlaylist = {
   __typename?: 'PaginationResultPlaylist'
   items: Array<Playlist>
   itemsLeft: Scalars['Int']
   limit: Scalars['Int']
   nextOffset?: Maybe<Scalars['Int']>
}

export type PaginationResultTrack = {
   __typename?: 'PaginationResultTrack'
   items: Array<Track>
   itemsLeft: Scalars['Int']
   limit: Scalars['Int']
   nextOffset?: Maybe<Scalars['Int']>
}

export type PlayEntityContextInput = {
   deviceId?: InputMaybe<Scalars['String']>
   offset: EntityOffsetInput
   positionMs?: InputMaybe<Scalars['Int']>
}

export type PlayInput = {
   deviceId?: InputMaybe<Scalars['String']>
}

export type PlayOffsetContextInput = {
   deviceId?: InputMaybe<Scalars['String']>
   offset: PositionOffsetInput
   positionMs?: InputMaybe<Scalars['Int']>
}

export type PlayTracksInput = {
   deviceId?: InputMaybe<Scalars['String']>
   positionMs?: InputMaybe<Scalars['Int']>
   trackIds: Array<Scalars['String']>
}

export type PlaybackContext = {
   __typename?: 'PlaybackContext'
   externalUrls: Array<KvStringString>
   href: Scalars['String']
   metadata?: Maybe<Array<KvStringString>>
   type: Scalars['String']
   uri: Scalars['String']
}

export type PlaybackDevice = {
   __typename?: 'PlaybackDevice'
   id: Scalars['String']
   isActive: Scalars['Boolean']
   isPrivateSession: Scalars['Boolean']
   isRestricted: Scalars['Boolean']
   name: Scalars['String']
   type: Scalars['String']
   volumePercent: Scalars['Int']
}

export type PlaybackState = {
   __typename?: 'PlaybackState'
   context?: Maybe<PlaybackContext>
   currentlyPlayingType: Scalars['String']
   device: PlaybackDevice
   isPlaying: Scalars['Boolean']
   item?: Maybe<Track>
   progressMs: Scalars['Long']
   repeatState: Scalars['String']
   shuffleState: Scalars['Boolean']
   timestamp: Scalars['Long']
}

export type Playlist = ReviewEntity & {
   __typename?: 'Playlist'
   collaborative: Scalars['Boolean']
   description: Scalars['String']
   externalUrls: Array<KvStringString>
   id: Scalars['String']
   images: Array<Scalars['String']>
   name: Scalars['String']
   owner: User
   primaryColor?: Maybe<Scalars['String']>
   public?: Maybe<Scalars['Boolean']>
   tracks?: Maybe<Array<PlaylistTrack>>
   uri: Scalars['String']
}

export type PlaylistTrack = {
   __typename?: 'PlaylistTrack'
   addedAt: Scalars['Instant']
   addedBy: User
   isLocal: Scalars['Boolean']
   playlist: Playlist
   track: Track
}

export type PositionOffsetInput = {
   context: ContextInput
   position: Scalars['Int']
}

export type Queries = {
   __typename?: 'Queries'
   availableDevices?: Maybe<Array<PlaybackDevice>>
   getAlbum?: Maybe<Album>
   getPlaylist?: Maybe<Playlist>
   getTrack?: Maybe<Track>
   review?: Maybe<Review>
   reviews?: Maybe<Array<Review>>
   search?: Maybe<SearchResult>
   user?: Maybe<User>
}

export type QueriesGetAlbumArgs = {
   id: Scalars['String']
}

export type QueriesGetPlaylistArgs = {
   id: Scalars['String']
}

export type QueriesGetTrackArgs = {
   id: Scalars['String']
}

export type QueriesReviewArgs = {
   id: Scalars['ID']
}

export type QueriesReviewsArgs = {
   reviewIds: Array<Scalars['ID']>
}

export type QueriesSearchArgs = {
   pagination?: InputMaybe<PaginationInput>
   query: Scalars['String']
   types: Array<EntityType>
}

export type QueriesUserArgs = {
   id?: InputMaybe<Scalars['String']>
}

export type Review = {
   __typename?: 'Review'
   childReviews?: Maybe<Array<Review>>
   collaborators?: Maybe<Array<Collaborator>>
   comments?: Maybe<Array<Comment>>
   createdAt: Scalars['Instant']
   creator: User
   entity?: Maybe<ReviewEntity>
   id: Scalars['ID']
   isPublic: Scalars['Boolean']
   reviewName: Scalars['String']
}

export type ReviewEntity = {
   externalUrls: Array<KvStringString>
   id: Scalars['String']
   name: Scalars['String']
   uri: Scalars['String']
}

export type ReviewEntityInput = {
   entityId: Scalars['String']
   entityType: EntityType
}

export type ReviewUpdate = CreatedComment | DeletedComment | UpdatedComment

export type SearchResult = {
   __typename?: 'SearchResult'
   albums?: Maybe<PaginationResultAlbum>
   artists?: Maybe<PaginationResultArtist>
   playlists?: Maybe<PaginationResultPlaylist>
   tracks?: Maybe<PaginationResultTrack>
}

export type SearchUserPlaylistsInput = {
   pagination: PaginationInput
   search?: InputMaybe<Scalars['String']>
}

export type SeekPlaybackInput = {
   deviceId?: InputMaybe<Scalars['String']>
   positionMs: Scalars['Int']
}

export type ShareReviewInput = {
   /** If not specified user will have access revoked. */
   accessLevel?: InputMaybe<AccessLevel>
   reviewId: Scalars['ID']
   userId: Scalars['String']
}

export type SpotifyProfile = {
   __typename?: 'SpotifyProfile'
   displayName?: Maybe<Scalars['String']>
   externalUrls: Array<KvStringString>
   href: Scalars['String']
   id: Scalars['String']
   images?: Maybe<Array<Scalars['String']>>
   numFollowers?: Maybe<Scalars['Int']>
   uri: Scalars['String']
}

export type Subscriptions = {
   __typename?: 'Subscriptions'
   availableDevices?: Maybe<Array<PlaybackDevice>>
   nowPlaying?: Maybe<PlaybackState>
   playlistTracks?: Maybe<PlaylistTrack>
   reviewUpdates?: Maybe<ReviewUpdate>
}

export type SubscriptionsNowPlayingArgs = {
   tickInterval: Scalars['Int']
}

export type SubscriptionsPlaylistTracksArgs = {
   input: GetPlaylistTracksInput
}

export type SubscriptionsReviewUpdatesArgs = {
   reviewIds: Array<Scalars['ID']>
}

export type Track = ReviewEntity & {
   __typename?: 'Track'
   album?: Maybe<Album>
   artists?: Maybe<Array<Artist>>
   audioFeatures?: Maybe<AudioFeatures>
   discNumber: Scalars['Int']
   durationMs: Scalars['Int']
   explicit: Scalars['Boolean']
   externalUrls: Array<KvStringString>
   href: Scalars['String']
   id: Scalars['String']
   isLiked?: Maybe<Scalars['Boolean']>
   isLocal?: Maybe<Scalars['Boolean']>
   isPlayable?: Maybe<Scalars['Boolean']>
   name: Scalars['String']
   popularity?: Maybe<Scalars['Int']>
   previewUrl?: Maybe<Scalars['String']>
   trackNumber: Scalars['Int']
   uri: Scalars['String']
}

export type TransferPlaybackInput = {
   deviceId: Scalars['String']
   play?: InputMaybe<Scalars['Boolean']>
}

export type UpdateCommentInput = {
   comment?: InputMaybe<Scalars['String']>
   commentId: Scalars['Int']
   reviewId: Scalars['ID']
}

export type UpdateReviewEntityInput = {
   entityId: Scalars['String']
   entityType: EntityType
   reviewId: Scalars['ID']
}

export type UpdateReviewInput = {
   isPublic: Scalars['Boolean']
   name: Scalars['String']
   reviewId: Scalars['ID']
}

export type UpdateReviewLinkInput = {
   childReviewId: Scalars['ID']
   linkIndex: Scalars['Int']
   parentReviewId: Scalars['ID']
}

export type UpdatedComment = {
   __typename?: 'UpdatedComment'
   comment: Comment
}

export type User = {
   __typename?: 'User'
   id: Scalars['String']
   playlists?: Maybe<Array<Playlist>>
   reviews?: Maybe<Array<Review>>
   spotifyProfile?: Maybe<SpotifyProfile>
}

export type UserPlaylistsArgs = {
   input: SearchUserPlaylistsInput
}

export type DetailedCommentFragment = {
   __typename?: 'Comment'
   id: number
   reviewId: string
   createdAt: string
   updatedAt: string
   parentCommentId?: number | null
   comment?: string | null
   commenter: {
      __typename?: 'User'
      id: string
      spotifyProfile?: {
         __typename?: 'SpotifyProfile'
         displayName?: string | null
         images?: Array<string> | null
      } | null
   }
   entities?: Array<
      | { __typename: 'Album'; id: string }
      | { __typename: 'Artist'; id: string }
      | { __typename: 'Playlist'; id: string }
      | { __typename: 'Track'; id: string }
   > | null
}

export type UserWithSpotifyOverviewFragment = {
   __typename?: 'User'
   id: string
   spotifyProfile?: {
      __typename?: 'SpotifyProfile'
      displayName?: string | null
      images?: Array<string> | null
   } | null
}

export type ReviewUpdatesSubscriptionVariables = Exact<{
   reviewIds: Array<Scalars['ID']> | Scalars['ID']
}>

export type ReviewUpdatesSubscription = {
   __typename?: 'Subscriptions'
   reviewUpdates?:
      | {
           __typename: 'CreatedComment'
           comment: {
              __typename?: 'Comment'
              id: number
              reviewId: string
              createdAt: string
              updatedAt: string
              parentCommentId?: number | null
              comment?: string | null
              commenter: {
                 __typename?: 'User'
                 id: string
                 spotifyProfile?: {
                    __typename?: 'SpotifyProfile'
                    displayName?: string | null
                    images?: Array<string> | null
                 } | null
              }
              entities?: Array<
                 | { __typename: 'Album'; id: string }
                 | { __typename: 'Artist'; id: string }
                 | { __typename: 'Playlist'; id: string }
                 | { __typename: 'Track'; id: string }
              > | null
           }
        }
      | { __typename: 'DeletedComment'; reviewId: string; commentId: number }
      | {
           __typename: 'UpdatedComment'
           comment: {
              __typename?: 'Comment'
              id: number
              reviewId: string
              createdAt: string
              updatedAt: string
              parentCommentId?: number | null
              comment?: string | null
              commenter: {
                 __typename?: 'User'
                 id: string
                 spotifyProfile?: {
                    __typename?: 'SpotifyProfile'
                    displayName?: string | null
                    images?: Array<string> | null
                 } | null
              }
              entities?: Array<
                 | { __typename: 'Album'; id: string }
                 | { __typename: 'Artist'; id: string }
                 | { __typename: 'Playlist'; id: string }
                 | { __typename: 'Track'; id: string }
              > | null
           }
        }
      | null
}

export const UserWithSpotifyOverviewFragmentDoc = gql`
   fragment UserWithSpotifyOverview on User {
      id
      spotifyProfile {
         displayName
         images
      }
   }
`
export const DetailedCommentFragmentDoc = gql`
   fragment DetailedComment on Comment {
      id
      reviewId
      createdAt
      updatedAt
      parentCommentId
      commenter {
         ...UserWithSpotifyOverview
      }
      comment
      entities {
         __typename
         id
      }
   }
   ${UserWithSpotifyOverviewFragmentDoc}
`
export const ReviewUpdatesDocument = gql`
   subscription ReviewUpdates($reviewIds: [ID!]!) {
      reviewUpdates(reviewIds: $reviewIds) {
         __typename
         ... on DeletedComment {
            reviewId
            commentId
         }
         ... on UpdatedComment {
            comment {
               ...DetailedComment
            }
         }
         ... on CreatedComment {
            comment {
               ...DetailedComment
            }
         }
      }
   }
   ${DetailedCommentFragmentDoc}
`

export function useReviewUpdatesSubscription<TData = ReviewUpdatesSubscription>(
   options: Omit<Urql.UseSubscriptionArgs<ReviewUpdatesSubscriptionVariables>, 'query'> = {},
   handler?: Urql.SubscriptionHandler<ReviewUpdatesSubscription, TData>
) {
   return Urql.useSubscription<ReviewUpdatesSubscription, TData, ReviewUpdatesSubscriptionVariables>(
      { query: ReviewUpdatesDocument, ...options },
      handler
   )
}
