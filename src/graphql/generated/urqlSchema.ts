import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | undefined
export type InputMaybe<T> = T | undefined
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

export type AccessLevel = 'Collaborator' | 'Viewer'

export type Album = ReviewEntity & {
   __typename?: 'Album'
   albumType: AlbumType
   artists?: Maybe<Array<Artist>>
   availableMarkets: Array<Scalars['String']>
   copyrights?: Maybe<Array<Copyright>>
   externalIds?: Maybe<ExternalIds>
   externalUrls?: Maybe<Array<KvStringString>>
   genres?: Maybe<Array<Scalars['String']>>
   href: Scalars['String']
   id: Scalars['String']
   images: Array<Scalars['String']>
   label?: Maybe<Scalars['String']>
   name: Scalars['String']
   popularity?: Maybe<Scalars['Int']>
   releaseDate: Scalars['String']
   releaseDatePrecision: ReleaseDatePrecision
   tracks?: Maybe<Array<Track>>
   uri: Scalars['String']
}

export type AlbumType = 'Album' | 'Compilation' | 'Single'

export type Artist = ReviewEntity & {
   __typename?: 'Artist'
   albums?: Maybe<Array<Album>>
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

export type AudioAnalysis = {
   __typename?: 'AudioAnalysis'
   bars: Array<TimeInterval>
   beats: Array<TimeInterval>
   sections: Array<AudioSection>
   segments: Array<AudioSegment>
   tatums: Array<TimeInterval>
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

export type AudioSection = {
   __typename?: 'AudioSection'
   confidence: Confidence
   duration: Scalars['Float']
   key: Scalars['Float']
   keyConfidence: Confidence
   loudness: Scalars['Float']
   mode: Modality
   modeConfidence: Confidence
   start: Scalars['Float']
   tempo: Scalars['Int']
   tempoConfidence: Confidence
   timeSignature: Scalars['Float']
   timeSignatureConfidence: Confidence
}

export type AudioSegment = {
   __typename?: 'AudioSegment'
   confidence: Confidence
   duration: Scalars['Float']
   loudness: Loudness
   pitches: Array<Scalars['Float']>
   start: Scalars['Float']
   timbre: Array<Scalars['Float']>
}

export type Collaborator = {
   __typename?: 'Collaborator'
   accessLevel: AccessLevel
   review?: Maybe<Review>
   user: User
}

export type Comment = {
   __typename?: 'Comment'
   childCommentIds: Array<Scalars['Long']>
   comment?: Maybe<Scalars['String']>
   commentIndex: Scalars['Int']
   commenter: User
   createdAt: Scalars['Instant']
   deleted: Scalars['Boolean']
   entities?: Maybe<Array<ReviewEntity>>
   id: Scalars['Long']
   parentCommentId?: Maybe<Scalars['Long']>
   reviewId: Scalars['ID']
   updatedAt: Scalars['Instant']
}

export type Confidence = {
   __typename?: 'Confidence'
   value: Scalars['Float']
}

export type Copyright = {
   __typename?: 'Copyright'
   text: Scalars['String']
   type: Scalars['String']
}

export type CreateCommentInput = {
   comment: Scalars['String']
   commentIndex?: InputMaybe<Scalars['Int']>
   entities: Array<ReviewEntityInput>
   parentCommentId?: InputMaybe<Scalars['Long']>
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
   commentId: Scalars['Long']
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
   commentId: Scalars['Long']
   reviewId: Scalars['ID']
}

export type EntityType = 'Album' | 'Artist' | 'Playlist' | 'Track'

export type ExternalIds = {
   __typename?: 'ExternalIds'
   ean?: Maybe<Scalars['String']>
   isrc?: Maybe<Scalars['String']>
   upc?: Maybe<Scalars['String']>
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

export type Loudness = {
   __typename?: 'Loudness'
   end?: Maybe<Scalars['Float']>
   max: Scalars['Float']
   maxTime: Scalars['Float']
   start: Scalars['Float']
}

export type Modality = 'Major' | 'Minor' | 'NoResult'

export type Mutations = {
   __typename?: 'Mutations'
   createComment?: Maybe<Comment>
   createReview?: Maybe<Review>
   deleteComment?: Maybe<Scalars['Boolean']>
   deleteReview?: Maybe<Scalars['Boolean']>
   deleteReviewLink?: Maybe<Scalars['Boolean']>
   linkReviews?: Maybe<Scalars['Boolean']>
   shareReview?: Maybe<Scalars['Boolean']>
   updateComment?: Maybe<Comment>
   updateCommentIndex?: Maybe<Scalars['Boolean']>
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

export type MutationsShareReviewArgs = {
   input: ShareReviewInput
}

export type MutationsUpdateCommentArgs = {
   input: UpdateCommentInput
}

export type MutationsUpdateCommentIndexArgs = {
   input: UpdateCommentIndexInput
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

export type NewCommentIndex = {
   __typename?: 'NewCommentIndex'
   commentId: Scalars['Long']
   commentIndex: Scalars['Int']
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
   description?: Maybe<Scalars['String']>
   externalUrls: Array<KvStringString>
   href: Scalars['String']
   id: Scalars['String']
   images: Array<Scalars['String']>
   name: Scalars['String']
   numberOfFollowers?: Maybe<Scalars['Int']>
   numberOfTracks: Scalars['Int']
   owner: User
   public?: Maybe<Scalars['Boolean']>
   snapshotId?: Maybe<Scalars['String']>
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

export type Queries = {
   __typename?: 'Queries'
   getAlbum?: Maybe<Album>
   getPlaylist?: Maybe<Playlist>
   getTrack?: Maybe<Track>
   review?: Maybe<Review>
   reviews?: Maybe<Array<Review>>
   search?: Maybe<SearchResult>
   user: User
   userMaybe?: Maybe<User>
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

export type QueriesUserMaybeArgs = {
   id?: InputMaybe<Scalars['String']>
}

export type ReleaseDatePrecision = 'Day' | 'Month' | 'Year'

export type Restrictions = {
   __typename?: 'Restrictions'
   reason: Scalars['String']
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
   href: Scalars['String']
   id: Scalars['String']
   name: Scalars['String']
   uri: Scalars['String']
}

export type ReviewEntityInput = {
   entityId: Scalars['String']
   entityType: EntityType
}

export type ReviewUpdate = CreatedComment | DeletedComment | UpdatedComment | UpdatedCommentIndex

export type SearchResult = {
   __typename?: 'SearchResult'
   albums?: Maybe<PaginationResultAlbum>
   artists?: Maybe<PaginationResultArtist>
   playlists?: Maybe<PaginationResultPlaylist>
   tracks?: Maybe<PaginationResultTrack>
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
   images: Array<Scalars['String']>
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

export type TimeInterval = {
   __typename?: 'TimeInterval'
   confidence: Confidence
   duration: Scalars['Float']
   start: Scalars['Float']
}

export type Track = ReviewEntity & {
   __typename?: 'Track'
   album?: Maybe<Album>
   artists: Array<Artist>
   audioAnalysis?: Maybe<AudioAnalysis>
   audioFeatures?: Maybe<AudioFeatures>
   availableMarkets?: Maybe<Array<Scalars['String']>>
   discNumber: Scalars['Int']
   durationMs: Scalars['Int']
   explicit: Scalars['Boolean']
   externalIds?: Maybe<ExternalIds>
   externalUrls?: Maybe<Array<KvStringString>>
   href: Scalars['String']
   id: Scalars['String']
   isLiked?: Maybe<Scalars['Boolean']>
   isLocal: Scalars['Boolean']
   isPlayable?: Maybe<Scalars['Boolean']>
   name: Scalars['String']
   popularity?: Maybe<Scalars['Int']>
   previewUrl?: Maybe<Scalars['String']>
   restrictions?: Maybe<Restrictions>
   trackNumber: Scalars['Int']
   uri: Scalars['String']
}

export type UpdateCommentIndexInput = {
   commentId: Scalars['Int']
   index: Scalars['Int']
   reviewId: Scalars['ID']
}

export type UpdateCommentInput = {
   comment: Scalars['String']
   commentId: Scalars['Long']
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

export type UpdatedCommentIndex = {
   __typename?: 'UpdatedCommentIndex'
   reviewId: Scalars['ID']
   updatedIndices: Array<NewCommentIndex>
}

export type User = {
   __typename?: 'User'
   id: Scalars['String']
   playlists?: Maybe<Array<Playlist>>
   reviews?: Maybe<Array<Review>>
   spotifyProfile?: Maybe<SpotifyProfile>
}

export type UserPlaylistsArgs = {
   pagination?: InputMaybe<PaginationInput>
}

export type CollaboratorFragment = {
   __typename?: 'Collaborator'
   accessLevel: AccessLevel
   user: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
         | undefined
   }
}

export type DetailedAlbumFragment = {
   __typename: 'Album'
   albumType: AlbumType
   genres?: Array<string> | undefined
   id: string
   images: Array<string>
   label?: string | undefined
   name: string
   releaseDate: string
   albumPopularity?: number | undefined
   tracks?:
      | Array<{
           __typename?: 'Track'
           uri: string
           id: string
           name: string
           durationMs: number
           explicit: boolean
           isPlayable?: boolean | undefined
           previewUrl?: string | undefined
           popularity?: number | undefined
           album?: { __typename?: 'Album'; images: Array<string>; id: string; name: string } | undefined
           artists: Array<{ __typename?: 'Artist'; name: string; id: string }>
        }>
      | undefined
   artists?: Array<{ __typename?: 'Artist'; id: string; name: string }> | undefined
}

export type AlbumDetailsFragment = {
   __typename: 'Album'
   albumType: AlbumType
   genres?: Array<string> | undefined
   id: string
   images: Array<string>
   label?: string | undefined
   name: string
   releaseDate: string
   albumPopularity?: number | undefined
   artists?: Array<{ __typename?: 'Artist'; id: string; name: string }> | undefined
}

export type DetailedArtistFragment = {
   __typename?: 'Artist'
   numFollowers?: number | undefined
   href: string
   id: string
   name: string
   artistGenres?: Array<string> | undefined
   artistImages?: Array<string> | undefined
   artistPopularity?: number | undefined
}

export type DetailedCommentFragment = {
   __typename?: 'Comment'
   id: number
   commentIndex: number
   reviewId: string
   createdAt: string
   updatedAt: string
   deleted: boolean
   parentCommentId?: number | undefined
   comment?: string | undefined
   commenter: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
         | undefined
   }
   entities?:
      | Array<
           | {
                __typename: 'Album'
                images: Array<string>
                id: string
                name: string
                albumArtists?: Array<{ __typename?: 'Artist'; name: string; id: string }> | undefined
             }
           | { __typename: 'Artist'; id: string; name: string; artistImages?: Array<string> | undefined }
           | {
                __typename: 'Playlist'
                images: Array<string>
                id: string
                name: string
                owner: {
                   __typename?: 'User'
                   id: string
                   spotifyProfile?:
                      | {
                           __typename?: 'SpotifyProfile'
                           id: string
                           displayName?: string | undefined
                           images: Array<string>
                           numFollowers?: number | undefined
                        }
                      | undefined
                }
             }
           | {
                __typename: 'Track'
                id: string
                name: string
                album?: { __typename?: 'Album'; images: Array<string> } | undefined
                trackArtists: Array<{ __typename?: 'Artist'; name: string; id: string }>
             }
        >
      | undefined
}

export type DetailedPlaylistFragment = {
   __typename: 'Playlist'
   collaborative: boolean
   description?: string | undefined
   id: string
   images: Array<string>
   name: string
   public?: boolean | undefined
   numberOfTracks: number
   tracks?:
      | Array<{
           __typename?: 'PlaylistTrack'
           addedAt: string
           addedBy: {
              __typename?: 'User'
              id: string
              spotifyProfile?:
                 | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
                 | undefined
           }
           track: {
              __typename?: 'Track'
              uri: string
              id: string
              name: string
              durationMs: number
              explicit: boolean
              isPlayable?: boolean | undefined
              previewUrl?: string | undefined
              popularity?: number | undefined
              album?: { __typename?: 'Album'; images: Array<string>; id: string; name: string } | undefined
              artists: Array<{ __typename?: 'Artist'; name: string; id: string }>
           }
           playlist: { __typename?: 'Playlist'; id: string }
        }>
      | undefined
   owner: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
         | undefined
   }
}

export type PlaylistDetailsFragment = {
   __typename: 'Playlist'
   collaborative: boolean
   description?: string | undefined
   id: string
   images: Array<string>
   name: string
   public?: boolean | undefined
   numberOfTracks: number
   owner: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
         | undefined
   }
}

export type DetailedPlaylistTrackFragment = {
   __typename?: 'PlaylistTrack'
   addedAt: string
   addedBy: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
         | undefined
   }
   track: {
      __typename?: 'Track'
      uri: string
      id: string
      name: string
      durationMs: number
      explicit: boolean
      isPlayable?: boolean | undefined
      previewUrl?: string | undefined
      popularity?: number | undefined
      album?: { __typename?: 'Album'; images: Array<string>; id: string; name: string } | undefined
      artists: Array<{ __typename?: 'Artist'; name: string; id: string }>
   }
   playlist: { __typename?: 'Playlist'; id: string }
}

export type DetailedTrackFragment = {
   __typename?: 'Track'
   uri: string
   id: string
   name: string
   durationMs: number
   explicit: boolean
   isPlayable?: boolean | undefined
   previewUrl?: string | undefined
   popularity?: number | undefined
   album?: { __typename?: 'Album'; images: Array<string>; id: string; name: string } | undefined
   artists: Array<{ __typename?: 'Artist'; name: string; id: string }>
}

export type ReviewDetailsFragment = {
   __typename?: 'Review'
   id: string
   createdAt: string
   reviewName: string
   isPublic: boolean
   creator: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
         | undefined
   }
   entity?:
      | {
           __typename: 'Album'
           images: Array<string>
           id: string
           name: string
           albumArtists?: Array<{ __typename?: 'Artist'; name: string; id: string }> | undefined
        }
      | { __typename: 'Artist'; id: string; name: string; artistImages?: Array<string> | undefined }
      | {
           __typename: 'Playlist'
           images: Array<string>
           id: string
           name: string
           owner: {
              __typename?: 'User'
              id: string
              spotifyProfile?:
                 | {
                      __typename?: 'SpotifyProfile'
                      id: string
                      displayName?: string | undefined
                      images: Array<string>
                      numFollowers?: number | undefined
                   }
                 | undefined
           }
        }
      | {
           __typename: 'Track'
           id: string
           name: string
           album?: { __typename?: 'Album'; images: Array<string> } | undefined
           trackArtists: Array<{ __typename?: 'Artist'; name: string; id: string }>
        }
      | undefined
   childReviews?:
      | Array<{
           __typename?: 'Review'
           id: string
           createdAt: string
           reviewName: string
           isPublic: boolean
           creator: {
              __typename?: 'User'
              id: string
              spotifyProfile?:
                 | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
                 | undefined
           }
           entity?:
              | {
                   __typename: 'Album'
                   images: Array<string>
                   id: string
                   name: string
                   albumArtists?: Array<{ __typename?: 'Artist'; name: string; id: string }> | undefined
                }
              | { __typename: 'Artist'; id: string; name: string; artistImages?: Array<string> | undefined }
              | {
                   __typename: 'Playlist'
                   images: Array<string>
                   id: string
                   name: string
                   owner: {
                      __typename?: 'User'
                      id: string
                      spotifyProfile?:
                         | {
                              __typename?: 'SpotifyProfile'
                              id: string
                              displayName?: string | undefined
                              images: Array<string>
                              numFollowers?: number | undefined
                           }
                         | undefined
                   }
                }
              | {
                   __typename: 'Track'
                   id: string
                   name: string
                   album?: { __typename?: 'Album'; images: Array<string> } | undefined
                   trackArtists: Array<{ __typename?: 'Artist'; name: string; id: string }>
                }
              | undefined
           collaborators?:
              | Array<{
                   __typename?: 'Collaborator'
                   accessLevel: AccessLevel
                   user: {
                      __typename?: 'User'
                      id: string
                      spotifyProfile?:
                         | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
                         | undefined
                   }
                }>
              | undefined
        }>
      | undefined
   collaborators?:
      | Array<{
           __typename?: 'Collaborator'
           accessLevel: AccessLevel
           user: {
              __typename?: 'User'
              id: string
              spotifyProfile?:
                 | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
                 | undefined
           }
        }>
      | undefined
}

type ReviewEntityOverview_Album_Fragment = {
   __typename: 'Album'
   images: Array<string>
   id: string
   name: string
   albumArtists?: Array<{ __typename?: 'Artist'; name: string; id: string }> | undefined
}

type ReviewEntityOverview_Artist_Fragment = {
   __typename: 'Artist'
   id: string
   name: string
   artistImages?: Array<string> | undefined
}

type ReviewEntityOverview_Playlist_Fragment = {
   __typename: 'Playlist'
   images: Array<string>
   id: string
   name: string
   owner: {
      __typename?: 'User'
      id: string
      spotifyProfile?:
         | {
              __typename?: 'SpotifyProfile'
              id: string
              displayName?: string | undefined
              images: Array<string>
              numFollowers?: number | undefined
           }
         | undefined
   }
}

type ReviewEntityOverview_Track_Fragment = {
   __typename: 'Track'
   id: string
   name: string
   album?: { __typename?: 'Album'; images: Array<string> } | undefined
   trackArtists: Array<{ __typename?: 'Artist'; name: string; id: string }>
}

export type ReviewEntityOverviewFragment =
   | ReviewEntityOverview_Album_Fragment
   | ReviewEntityOverview_Artist_Fragment
   | ReviewEntityOverview_Playlist_Fragment
   | ReviewEntityOverview_Track_Fragment

export type UserWithSpotifyOverviewFragment = {
   __typename?: 'User'
   id: string
   spotifyProfile?:
      | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
      | undefined
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
              commentIndex: number
              reviewId: string
              createdAt: string
              updatedAt: string
              deleted: boolean
              parentCommentId?: number | undefined
              comment?: string | undefined
              commenter: {
                 __typename?: 'User'
                 id: string
                 spotifyProfile?:
                    | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
                    | undefined
              }
              entities?:
                 | Array<
                      | {
                           __typename: 'Album'
                           images: Array<string>
                           id: string
                           name: string
                           albumArtists?: Array<{ __typename?: 'Artist'; name: string; id: string }> | undefined
                        }
                      | { __typename: 'Artist'; id: string; name: string; artistImages?: Array<string> | undefined }
                      | {
                           __typename: 'Playlist'
                           images: Array<string>
                           id: string
                           name: string
                           owner: {
                              __typename?: 'User'
                              id: string
                              spotifyProfile?:
                                 | {
                                      __typename?: 'SpotifyProfile'
                                      id: string
                                      displayName?: string | undefined
                                      images: Array<string>
                                      numFollowers?: number | undefined
                                   }
                                 | undefined
                           }
                        }
                      | {
                           __typename: 'Track'
                           id: string
                           name: string
                           album?: { __typename?: 'Album'; images: Array<string> } | undefined
                           trackArtists: Array<{ __typename?: 'Artist'; name: string; id: string }>
                        }
                   >
                 | undefined
           }
        }
      | { __typename: 'DeletedComment'; reviewId: string; commentId: number }
      | {
           __typename: 'UpdatedComment'
           comment: {
              __typename?: 'Comment'
              id: number
              commentIndex: number
              reviewId: string
              createdAt: string
              updatedAt: string
              deleted: boolean
              parentCommentId?: number | undefined
              comment?: string | undefined
              commenter: {
                 __typename?: 'User'
                 id: string
                 spotifyProfile?:
                    | { __typename?: 'SpotifyProfile'; displayName?: string | undefined; images: Array<string> }
                    | undefined
              }
              entities?:
                 | Array<
                      | {
                           __typename: 'Album'
                           images: Array<string>
                           id: string
                           name: string
                           albumArtists?: Array<{ __typename?: 'Artist'; name: string; id: string }> | undefined
                        }
                      | { __typename: 'Artist'; id: string; name: string; artistImages?: Array<string> | undefined }
                      | {
                           __typename: 'Playlist'
                           images: Array<string>
                           id: string
                           name: string
                           owner: {
                              __typename?: 'User'
                              id: string
                              spotifyProfile?:
                                 | {
                                      __typename?: 'SpotifyProfile'
                                      id: string
                                      displayName?: string | undefined
                                      images: Array<string>
                                      numFollowers?: number | undefined
                                   }
                                 | undefined
                           }
                        }
                      | {
                           __typename: 'Track'
                           id: string
                           name: string
                           album?: { __typename?: 'Album'; images: Array<string> } | undefined
                           trackArtists: Array<{ __typename?: 'Artist'; name: string; id: string }>
                        }
                   >
                 | undefined
           }
        }
      | { __typename: 'UpdatedCommentIndex' }
      | undefined
}

export const AlbumDetailsFragmentDoc = gql`
   fragment AlbumDetails on Album {
      __typename
      albumType
      genres
      id
      images
      label
      name
      albumPopularity: popularity
      releaseDate
      artists {
         id
         name
      }
   }
`
export const DetailedTrackFragmentDoc = gql`
   fragment DetailedTrack on Track {
      uri
      id
      name
      durationMs
      explicit
      isPlayable
      previewUrl
      popularity
      album {
         images
         id
         name
      }
      artists {
         name
         id
      }
   }
`
export const DetailedAlbumFragmentDoc = gql`
   fragment DetailedAlbum on Album {
      ...AlbumDetails
      tracks {
         ...DetailedTrack
      }
   }
   ${AlbumDetailsFragmentDoc}
   ${DetailedTrackFragmentDoc}
`
export const DetailedArtistFragmentDoc = gql`
   fragment DetailedArtist on Artist {
      numFollowers
      artistGenres: genres
      href
      id
      artistImages: images
      name
      artistPopularity: popularity
   }
`
export const UserWithSpotifyOverviewFragmentDoc = gql`
   fragment UserWithSpotifyOverview on User {
      id
      spotifyProfile {
         displayName
         images
      }
   }
`
export const ReviewEntityOverviewFragmentDoc = gql`
   fragment ReviewEntityOverview on ReviewEntity {
      __typename
      id
      name
      ... on Album {
         images
         albumArtists: artists {
            name
            id
         }
      }
      ... on Artist {
         artistImages: images
      }
      ... on Playlist {
         owner {
            id
            spotifyProfile {
               id
               displayName
               images
               numFollowers
            }
         }
         images
      }
      ... on Track {
         album {
            images
         }
         trackArtists: artists {
            name
            id
         }
      }
   }
`
export const DetailedCommentFragmentDoc = gql`
   fragment DetailedComment on Comment {
      id
      commentIndex
      reviewId
      createdAt
      updatedAt
      deleted
      parentCommentId
      commenter {
         ...UserWithSpotifyOverview
      }
      comment
      entities {
         ...ReviewEntityOverview
      }
   }
   ${UserWithSpotifyOverviewFragmentDoc}
   ${ReviewEntityOverviewFragmentDoc}
`
export const PlaylistDetailsFragmentDoc = gql`
   fragment PlaylistDetails on Playlist {
      __typename
      collaborative
      description
      id
      images
      name
      public
      owner {
         ...UserWithSpotifyOverview
      }
      numberOfTracks
   }
   ${UserWithSpotifyOverviewFragmentDoc}
`
export const DetailedPlaylistTrackFragmentDoc = gql`
   fragment DetailedPlaylistTrack on PlaylistTrack {
      addedAt
      addedBy {
         ...UserWithSpotifyOverview
      }
      track {
         ...DetailedTrack
      }
      playlist {
         id
      }
   }
   ${UserWithSpotifyOverviewFragmentDoc}
   ${DetailedTrackFragmentDoc}
`
export const DetailedPlaylistFragmentDoc = gql`
   fragment DetailedPlaylist on Playlist {
      ...PlaylistDetails
      tracks {
         ...DetailedPlaylistTrack
      }
   }
   ${PlaylistDetailsFragmentDoc}
   ${DetailedPlaylistTrackFragmentDoc}
`
export const CollaboratorFragmentDoc = gql`
   fragment Collaborator on Collaborator {
      accessLevel
      user {
         ...UserWithSpotifyOverview
      }
   }
   ${UserWithSpotifyOverviewFragmentDoc}
`
export const ReviewDetailsFragmentDoc = gql`
   fragment ReviewDetails on Review {
      id
      createdAt
      creator {
         ...UserWithSpotifyOverview
      }
      reviewName
      isPublic
      entity {
         ...ReviewEntityOverview
      }
      childReviews {
         id
         createdAt
         reviewName
         creator {
            ...UserWithSpotifyOverview
         }
         isPublic
         entity {
            ...ReviewEntityOverview
         }
         collaborators {
            ...Collaborator
         }
      }
      collaborators {
         ...Collaborator
      }
   }
   ${UserWithSpotifyOverviewFragmentDoc}
   ${ReviewEntityOverviewFragmentDoc}
   ${CollaboratorFragmentDoc}
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
