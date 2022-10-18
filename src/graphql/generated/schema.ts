import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Instant: string;
  Long: number;
};

export enum AccessLevel {
  Collaborator = 'Collaborator',
  Viewer = 'Viewer'
}

export type Album = ReviewEntity & {
  __typename?: 'Album';
  albumGroup?: Maybe<Scalars['String']>;
  albumType: Scalars['String'];
  artists?: Maybe<Array<Artist>>;
  externalUrls: Array<KvStringString>;
  genres: Array<Scalars['String']>;
  id: Scalars['String'];
  images: Array<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  popularity?: Maybe<Scalars['Int']>;
  releaseDate: Scalars['String'];
  tracks?: Maybe<Array<Track>>;
  uri: Scalars['String'];
};

export type Artist = ReviewEntity & {
  __typename?: 'Artist';
  albums?: Maybe<Array<Album>>;
  externalUrls: Array<KvStringString>;
  genres: Array<Scalars['String']>;
  href: Scalars['String'];
  id: Scalars['String'];
  images: Array<Scalars['String']>;
  name: Scalars['String'];
  numFollowers: Scalars['Int'];
  popularity: Scalars['Int'];
  topTracks?: Maybe<Array<Track>>;
  uri: Scalars['String'];
};

export type Collaborator = {
  __typename?: 'Collaborator';
  accessLevel: AccessLevel;
  user: User;
};

export type Comment = {
  __typename?: 'Comment';
  comment?: Maybe<Scalars['String']>;
  commenter?: Maybe<User>;
  commenterId: Scalars['String'];
  createdAt: Scalars['Instant'];
  entity?: Maybe<ReviewEntity>;
  entityId: Scalars['String'];
  entityType: EntityType;
  id: Scalars['Int'];
  parentCommentId?: Maybe<Scalars['Int']>;
  rating?: Maybe<Scalars['Int']>;
  reviewId: Scalars['ID'];
  updatedAt: Scalars['Instant'];
};

export type ContextInput = {
  entityId: Scalars['String'];
  entityType: EntityType;
};

export type CreateCommentInput = {
  comment?: InputMaybe<Scalars['String']>;
  entityId: Scalars['String'];
  entityType: EntityType;
  parentCommentId?: InputMaybe<Scalars['Int']>;
  rating?: InputMaybe<Scalars['Int']>;
  reviewId: Scalars['ID'];
};

export type CreateReviewInput = {
  entityId: Scalars['String'];
  entityType: EntityType;
  isPublic: Scalars['Boolean'];
  name: Scalars['String'];
};

export type CreatedComment = {
  __typename?: 'CreatedComment';
  comment: Comment;
};

export type DeleteCommentInput = {
  commentId: Scalars['Int'];
  reviewId: Scalars['ID'];
};

export type DeleteReviewInput = {
  id: Scalars['ID'];
};

export type DeletedComment = {
  __typename?: 'DeletedComment';
  commentId: Scalars['Int'];
  reviewId: Scalars['ID'];
};

export type EntityOffsetInput = {
  inner: ContextInput;
  outer: ContextInput;
};

export enum EntityType {
  Album = 'Album',
  Artist = 'Artist',
  Playlist = 'Playlist',
  Track = 'Track'
}

export type GetPlaylistTracksInput = {
  numTracks: Scalars['Int'];
  playlistId: Scalars['String'];
};

/** A key-value pair of String and String */
export type KvStringString = {
  __typename?: 'KVStringString';
  /** Key */
  key: Scalars['String'];
  /** Value */
  value: Scalars['String'];
};

export type Mutations = {
  __typename?: 'Mutations';
  createComment?: Maybe<Comment>;
  createReview?: Maybe<Review>;
  deleteComment?: Maybe<Scalars['Boolean']>;
  deleteReview?: Maybe<Scalars['Boolean']>;
  saveTracks?: Maybe<Scalars['Boolean']>;
  seekPlayback?: Maybe<Scalars['Boolean']>;
  shareReview?: Maybe<Scalars['Boolean']>;
  startPlayback?: Maybe<Scalars['Boolean']>;
  updateComment?: Maybe<Comment>;
  updateReview?: Maybe<Review>;
};


export type MutationsCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationsCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationsDeleteCommentArgs = {
  input: DeleteCommentInput;
};


export type MutationsDeleteReviewArgs = {
  input: DeleteReviewInput;
};


export type MutationsSaveTracksArgs = {
  input: Array<Scalars['String']>;
};


export type MutationsSeekPlaybackArgs = {
  input: SeekPlaybackInput;
};


export type MutationsShareReviewArgs = {
  input: ShareReviewInput;
};


export type MutationsStartPlaybackArgs = {
  input: StartPlaybackInput;
};


export type MutationsUpdateCommentArgs = {
  input: UpdateCommentInput;
};


export type MutationsUpdateReviewArgs = {
  input: UpdateReviewInput;
};

export type PaginationInput = {
  first: Scalars['Int'];
  from?: Scalars['Int'];
};

export type PlaybackContext = {
  __typename?: 'PlaybackContext';
  externalUrls: Array<KvStringString>;
  href: Scalars['String'];
  metadata?: Maybe<Array<KvStringString>>;
  type: Scalars['String'];
  uri: Scalars['String'];
};

export type PlaybackDevice = {
  __typename?: 'PlaybackDevice';
  id: Scalars['String'];
  isActive: Scalars['Boolean'];
  isPrivateSession: Scalars['Boolean'];
  isRestricted: Scalars['Boolean'];
  name: Scalars['String'];
  type: Scalars['String'];
  volumePercent: Scalars['Int'];
};

export type PlaybackState = {
  __typename?: 'PlaybackState';
  context?: Maybe<PlaybackContext>;
  currentlyPlayingType: Scalars['String'];
  device: PlaybackDevice;
  isPlaying: Scalars['Boolean'];
  item?: Maybe<Track>;
  progressMs: Scalars['Long'];
  repeatState: Scalars['String'];
  shuffleState: Scalars['Boolean'];
  timestamp: Scalars['Long'];
};

export type Playlist = ReviewEntity & {
  __typename?: 'Playlist';
  collaborative: Scalars['Boolean'];
  description: Scalars['String'];
  externalUrls: Array<KvStringString>;
  id: Scalars['String'];
  images: Array<Scalars['String']>;
  name: Scalars['String'];
  owner: User;
  primaryColor?: Maybe<Scalars['String']>;
  public?: Maybe<Scalars['Boolean']>;
  tracks?: Maybe<Array<PlaylistTrack>>;
  uri: Scalars['String'];
};

export type PlaylistTrack = {
  __typename?: 'PlaylistTrack';
  addedAt: Scalars['Instant'];
  addedBy: User;
  isLocal: Scalars['Boolean'];
  track: Track;
};

export type PositionOffsetInput = {
  context: ContextInput;
  position: Scalars['Int'];
};

export type Queries = {
  __typename?: 'Queries';
  availableDevices?: Maybe<Array<PlaybackDevice>>;
  review?: Maybe<Review>;
  search?: Maybe<SearchResult>;
  user?: Maybe<User>;
};


export type QueriesReviewArgs = {
  id: Scalars['ID'];
};


export type QueriesSearchArgs = {
  pagination?: InputMaybe<PaginationInput>;
  query: Scalars['String'];
  types: Array<EntityType>;
};


export type QueriesUserArgs = {
  id?: InputMaybe<Scalars['String']>;
};

export type Review = {
  __typename?: 'Review';
  collaborators?: Maybe<Array<Collaborator>>;
  comments?: Maybe<Array<Comment>>;
  createdAt: Scalars['Instant'];
  creator: User;
  entity: ReviewEntity;
  entityId: Scalars['String'];
  entityType: EntityType;
  id: Scalars['ID'];
  isPublic: Scalars['Boolean'];
  reviewName: Scalars['String'];
};

export type ReviewEntity = {
  externalUrls: Array<KvStringString>;
  id: Scalars['String'];
  name: Scalars['String'];
  uri: Scalars['String'];
};

export type ReviewUpdate = CreatedComment | DeletedComment | UpdatedComment;

export type SearchResult = {
  __typename?: 'SearchResult';
  albums: Array<Album>;
  artists: Array<Artist>;
  playlists: Array<Playlist>;
  tracks: Array<Track>;
};

export type SeekPlaybackInput = {
  deviceId?: InputMaybe<Scalars['String']>;
  positionMs: Scalars['Int'];
};

export type ShareReviewInput = {
  access: AccessLevel;
  reviewId: Scalars['ID'];
  userId: Scalars['String'];
};

export type SpotifyProfile = {
  __typename?: 'SpotifyProfile';
  displayName?: Maybe<Scalars['String']>;
  externalUrls: Array<KvStringString>;
  href: Scalars['String'];
  id: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  numFollowers?: Maybe<Scalars['Int']>;
  uri: Scalars['String'];
};

export type StartPlaybackInput = {
  /** If device id is specified, playback will be transferred to that device. Otherwise, playback will be executed on user's active device. */
  deviceId?: InputMaybe<Scalars['String']>;
  entityOffset?: InputMaybe<EntityOffsetInput>;
  positionMs?: InputMaybe<Scalars['Int']>;
  positionOffset?: InputMaybe<PositionOffsetInput>;
  uris?: InputMaybe<Array<Scalars['String']>>;
};

export type Subscriptions = {
  __typename?: 'Subscriptions';
  availableDevices?: Maybe<Array<PlaybackDevice>>;
  nowPlaying?: Maybe<PlaybackState>;
  playlistTracks?: Maybe<PlaylistTrack>;
  reviewUpdates?: Maybe<ReviewUpdate>;
};


export type SubscriptionsNowPlayingArgs = {
  tickInterval: Scalars['Int'];
};


export type SubscriptionsPlaylistTracksArgs = {
  input: GetPlaylistTracksInput;
};


export type SubscriptionsReviewUpdatesArgs = {
  reviewId: Scalars['ID'];
};

export type Track = ReviewEntity & {
  __typename?: 'Track';
  album?: Maybe<Album>;
  artists?: Maybe<Array<Artist>>;
  discNumber: Scalars['Int'];
  durationMs: Scalars['Int'];
  explicit: Scalars['Boolean'];
  externalUrls: Array<KvStringString>;
  href: Scalars['String'];
  id: Scalars['String'];
  isLiked?: Maybe<Scalars['Boolean']>;
  isLocal: Scalars['Boolean'];
  isPlayable?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  popularity?: Maybe<Scalars['Int']>;
  previewUrl?: Maybe<Scalars['String']>;
  trackNumber: Scalars['Int'];
  uri: Scalars['String'];
};

export type UpdateCommentInput = {
  comment?: InputMaybe<Scalars['String']>;
  commentId: Scalars['Int'];
  rating?: InputMaybe<Scalars['Int']>;
  reviewId: Scalars['ID'];
};

export type UpdateReviewInput = {
  isPublic: Scalars['Boolean'];
  name: Scalars['String'];
  reviewId: Scalars['ID'];
};

export type UpdatedComment = {
  __typename?: 'UpdatedComment';
  comment: Comment;
};

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  reviews?: Maybe<Array<Review>>;
  spotifyProfile?: Maybe<SpotifyProfile>;
};

export type DetailedCommentFragment = { __typename?: 'Comment', id: number, reviewId: string, createdAt: string, updatedAt: string, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } | null };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutations', createComment?: { __typename?: 'Comment', id: number, createdAt: string, updatedAt: string } | null };

export type CreateReviewMutationVariables = Exact<{
  input: CreateReviewInput;
}>;


export type CreateReviewMutation = { __typename?: 'Mutations', createReview?: { __typename?: 'Review', entityType: EntityType, id: string } | null };

export type DeleteCommentMutationVariables = Exact<{
  input: DeleteCommentInput;
}>;


export type DeleteCommentMutation = { __typename?: 'Mutations', deleteComment?: boolean | null };

export type SeekPlaybackMutationVariables = Exact<{
  input: SeekPlaybackInput;
}>;


export type SeekPlaybackMutation = { __typename?: 'Mutations', seekPlayback?: boolean | null };

export type ShareReviewMutationVariables = Exact<{
  input: ShareReviewInput;
}>;


export type ShareReviewMutation = { __typename?: 'Mutations', shareReview?: boolean | null };

export type StartPlaybackMutationVariables = Exact<{
  input: StartPlaybackInput;
}>;


export type StartPlaybackMutation = { __typename?: 'Mutations', startPlayback?: boolean | null };

export type UpdateCommentMutationVariables = Exact<{
  input: UpdateCommentInput;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutations', updateComment?: { __typename?: 'Comment', id: number } | null };

export type DetailedReviewQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type DetailedReviewQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: string, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity: { __typename?: 'Album', albumGroup?: string | null, albumType: string, genres: Array<string>, id: string, images: Array<string>, label?: string | null, name: string, releaseDate: string, albumPopularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null, tracks?: Array<{ __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null }> | null } | { __typename?: 'Artist', numFollowers: number, genres: Array<string>, href: string, id: string, images: Array<string>, name: string, artistPopularity: number } | { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, tracks?: Array<{ __typename?: 'PlaylistTrack', addedAt: string, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, track: { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null } | { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null }, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null } | null };

export type UserWithSpotifyOverviewFragment = { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null };

export type DetailedTrackFragment = { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

export type DetailedPlaylistFragment = { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, tracks?: Array<{ __typename?: 'PlaylistTrack', addedAt: string, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, track: { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null };

export type DetailedPlaylistTrackFragment = { __typename?: 'PlaylistTrack', addedAt: string, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, track: { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } };

export type DetailedAlbumFragment = { __typename?: 'Album', albumGroup?: string | null, albumType: string, genres: Array<string>, id: string, images: Array<string>, label?: string | null, name: string, releaseDate: string, albumPopularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null, tracks?: Array<{ __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null }> | null };

export type DetailedArtistFragment = { __typename?: 'Artist', numFollowers: number, genres: Array<string>, href: string, id: string, images: Array<string>, name: string, artistPopularity: number };

export type DetailedReviewCommentsQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type DetailedReviewCommentsQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', comments?: Array<{ __typename?: 'Comment', id: number, reviewId: string, createdAt: string, updatedAt: string, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } | null }> | null } | null };

export type ProfileAndReviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileAndReviewsQuery = { __typename?: 'Queries', user?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null, reviews?: Array<{ __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: string, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity: { __typename?: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename?: 'Artist', images: Array<string>, id: string, name: string } | { __typename?: 'Playlist', images: Array<string>, id: string, name: string } | { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null } | null };

export type ReviewOverviewFragment = { __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: string, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity: { __typename?: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename?: 'Artist', images: Array<string>, id: string, name: string } | { __typename?: 'Playlist', images: Array<string>, id: string, name: string } | { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } };

type ReviewEntityOverview_Album_Fragment = { __typename?: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

type ReviewEntityOverview_Artist_Fragment = { __typename?: 'Artist', images: Array<string>, id: string, name: string };

type ReviewEntityOverview_Playlist_Fragment = { __typename?: 'Playlist', images: Array<string>, id: string, name: string };

type ReviewEntityOverview_Track_Fragment = { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

export type ReviewEntityOverviewFragment = ReviewEntityOverview_Album_Fragment | ReviewEntityOverview_Artist_Fragment | ReviewEntityOverview_Playlist_Fragment | ReviewEntityOverview_Track_Fragment;

export type AvailableDevicesSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AvailableDevicesSubscription = { __typename?: 'Subscriptions', availableDevices?: Array<{ __typename?: 'PlaybackDevice', id: string, isActive: boolean, isPrivateSession: boolean, isRestricted: boolean, name: string, type: string, volumePercent: number }> | null };

export type PlaybackDeviceFragment = { __typename?: 'PlaybackDevice', id: string, isActive: boolean, isPrivateSession: boolean, isRestricted: boolean, name: string, type: string, volumePercent: number };

export type NowPlayingSubscriptionVariables = Exact<{
  input: Scalars['Int'];
}>;


export type NowPlayingSubscription = { __typename?: 'Subscriptions', nowPlaying?: { __typename?: 'PlaybackState', shuffleState: boolean, timestamp: number, progressMs: number, device: { __typename?: 'PlaybackDevice', id: string, name: string }, item?: { __typename?: 'Track', id: string, name: string, durationMs: number, isLiked?: boolean | null, artists?: Array<{ __typename?: 'Artist', name: string }> | null, album?: { __typename?: 'Album', name: string, id: string, images: Array<string> } | null } | null } | null };

export type PlaybackStateFragment = { __typename?: 'PlaybackState', shuffleState: boolean, timestamp: number, progressMs: number, device: { __typename?: 'PlaybackDevice', id: string, name: string }, item?: { __typename?: 'Track', id: string, name: string, durationMs: number, isLiked?: boolean | null, artists?: Array<{ __typename?: 'Artist', name: string }> | null, album?: { __typename?: 'Album', name: string, id: string, images: Array<string> } | null } | null };

export type NowPlayingOffsetSubscriptionVariables = Exact<{
  input: Scalars['Int'];
}>;


export type NowPlayingOffsetSubscription = { __typename?: 'Subscriptions', nowPlaying?: { __typename?: 'PlaybackState', timestamp: number, progressMs: number, item?: { __typename?: 'Track', id: string, durationMs: number } | null } | null };

export type ReviewUpdatesSubscriptionVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type ReviewUpdatesSubscription = { __typename?: 'Subscriptions', reviewUpdates?: { __typename?: 'CreatedComment', comment: { __typename?: 'Comment', id: number, reviewId: string, createdAt: string, updatedAt: string, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } | null } } | { __typename?: 'DeletedComment', reviewId: string, commentId: number } | { __typename?: 'UpdatedComment', comment: { __typename?: 'Comment', id: number, reviewId: string, createdAt: string, updatedAt: string, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } | null } } | null };

export const UserWithSpotifyOverviewFragmentDoc = gql`
    fragment UserWithSpotifyOverview on User {
  id
  spotifyProfile {
    displayName
    images
  }
}
    `;
export const DetailedCommentFragmentDoc = gql`
    fragment DetailedComment on Comment {
  id
  reviewId
  createdAt
  updatedAt
  parentCommentId
  commenterId
  commenter {
    ...UserWithSpotifyOverview
  }
  comment
  rating
  entityId
  entityType
}
    ${UserWithSpotifyOverviewFragmentDoc}`;
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
  }
  artists {
    name
    id
  }
}
    `;
export const DetailedPlaylistTrackFragmentDoc = gql`
    fragment DetailedPlaylistTrack on PlaylistTrack {
  addedAt
  addedBy {
    ...UserWithSpotifyOverview
  }
  track {
    ...DetailedTrack
  }
}
    ${UserWithSpotifyOverviewFragmentDoc}
${DetailedTrackFragmentDoc}`;
export const DetailedPlaylistFragmentDoc = gql`
    fragment DetailedPlaylist on Playlist {
  collaborative
  description
  id
  images
  name
  owner {
    ...UserWithSpotifyOverview
  }
  tracks {
    ...DetailedPlaylistTrack
  }
  primaryColor
  public
}
    ${UserWithSpotifyOverviewFragmentDoc}
${DetailedPlaylistTrackFragmentDoc}`;
export const DetailedAlbumFragmentDoc = gql`
    fragment DetailedAlbum on Album {
  albumGroup
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
  tracks {
    id
    name
    durationMs
    explicit
    isPlayable
    previewUrl
    popularity
    artists {
      id
      name
    }
  }
}
    `;
export const DetailedArtistFragmentDoc = gql`
    fragment DetailedArtist on Artist {
  numFollowers
  genres
  href
  id
  images
  name
  artistPopularity: popularity
}
    `;
export const ReviewEntityOverviewFragmentDoc = gql`
    fragment ReviewEntityOverview on ReviewEntity {
  id
  name
  ... on Album {
    images
    artists {
      name
      id
    }
  }
  ... on Artist {
    images
  }
  ... on Playlist {
    images
  }
  ... on Track {
    album {
      images
    }
    artists {
      name
      id
    }
  }
}
    `;
export const ReviewOverviewFragmentDoc = gql`
    fragment ReviewOverview on Review {
  reviewName
  id
  entityType
  entityId
  createdAt
  creator {
    ...UserWithSpotifyOverview
  }
  entity {
    ...ReviewEntityOverview
  }
}
    ${UserWithSpotifyOverviewFragmentDoc}
${ReviewEntityOverviewFragmentDoc}`;
export const PlaybackDeviceFragmentDoc = gql`
    fragment PlaybackDevice on PlaybackDevice {
  id
  isActive
  isPrivateSession
  isRestricted
  name
  type
  volumePercent
}
    `;
export const PlaybackStateFragmentDoc = gql`
    fragment PlaybackState on PlaybackState {
  device {
    id
    name
  }
  shuffleState
  timestamp
  progressMs
  item {
    id
    name
    durationMs
    isLiked
    artists {
      name
    }
    album {
      name
      id
      images
    }
  }
}
    `;
export const CreateCommentDocument = gql`
    mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    createdAt
    updatedAt
  }
}
    `;
export type CreateCommentMutationFn = Apollo.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, options);
      }
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const CreateReviewDocument = gql`
    mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    entityType
    id
  }
}
    `;
export type CreateReviewMutationFn = Apollo.MutationFunction<CreateReviewMutation, CreateReviewMutationVariables>;

/**
 * __useCreateReviewMutation__
 *
 * To run a mutation, you first call `useCreateReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewMutation, { data, loading, error }] = useCreateReviewMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReviewMutation(baseOptions?: Apollo.MutationHookOptions<CreateReviewMutation, CreateReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateReviewMutation, CreateReviewMutationVariables>(CreateReviewDocument, options);
      }
export type CreateReviewMutationHookResult = ReturnType<typeof useCreateReviewMutation>;
export type CreateReviewMutationResult = Apollo.MutationResult<CreateReviewMutation>;
export type CreateReviewMutationOptions = Apollo.BaseMutationOptions<CreateReviewMutation, CreateReviewMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($input: DeleteCommentInput!) {
  deleteComment(input: $input)
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const SeekPlaybackDocument = gql`
    mutation SeekPlayback($input: SeekPlaybackInput!) {
  seekPlayback(input: $input)
}
    `;
export type SeekPlaybackMutationFn = Apollo.MutationFunction<SeekPlaybackMutation, SeekPlaybackMutationVariables>;

/**
 * __useSeekPlaybackMutation__
 *
 * To run a mutation, you first call `useSeekPlaybackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSeekPlaybackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [seekPlaybackMutation, { data, loading, error }] = useSeekPlaybackMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSeekPlaybackMutation(baseOptions?: Apollo.MutationHookOptions<SeekPlaybackMutation, SeekPlaybackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SeekPlaybackMutation, SeekPlaybackMutationVariables>(SeekPlaybackDocument, options);
      }
export type SeekPlaybackMutationHookResult = ReturnType<typeof useSeekPlaybackMutation>;
export type SeekPlaybackMutationResult = Apollo.MutationResult<SeekPlaybackMutation>;
export type SeekPlaybackMutationOptions = Apollo.BaseMutationOptions<SeekPlaybackMutation, SeekPlaybackMutationVariables>;
export const ShareReviewDocument = gql`
    mutation ShareReview($input: ShareReviewInput!) {
  shareReview(input: $input)
}
    `;
export type ShareReviewMutationFn = Apollo.MutationFunction<ShareReviewMutation, ShareReviewMutationVariables>;

/**
 * __useShareReviewMutation__
 *
 * To run a mutation, you first call `useShareReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useShareReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [shareReviewMutation, { data, loading, error }] = useShareReviewMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useShareReviewMutation(baseOptions?: Apollo.MutationHookOptions<ShareReviewMutation, ShareReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ShareReviewMutation, ShareReviewMutationVariables>(ShareReviewDocument, options);
      }
export type ShareReviewMutationHookResult = ReturnType<typeof useShareReviewMutation>;
export type ShareReviewMutationResult = Apollo.MutationResult<ShareReviewMutation>;
export type ShareReviewMutationOptions = Apollo.BaseMutationOptions<ShareReviewMutation, ShareReviewMutationVariables>;
export const StartPlaybackDocument = gql`
    mutation StartPlayback($input: StartPlaybackInput!) {
  startPlayback(input: $input)
}
    `;
export type StartPlaybackMutationFn = Apollo.MutationFunction<StartPlaybackMutation, StartPlaybackMutationVariables>;

/**
 * __useStartPlaybackMutation__
 *
 * To run a mutation, you first call `useStartPlaybackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStartPlaybackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [startPlaybackMutation, { data, loading, error }] = useStartPlaybackMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useStartPlaybackMutation(baseOptions?: Apollo.MutationHookOptions<StartPlaybackMutation, StartPlaybackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StartPlaybackMutation, StartPlaybackMutationVariables>(StartPlaybackDocument, options);
      }
export type StartPlaybackMutationHookResult = ReturnType<typeof useStartPlaybackMutation>;
export type StartPlaybackMutationResult = Apollo.MutationResult<StartPlaybackMutation>;
export type StartPlaybackMutationOptions = Apollo.BaseMutationOptions<StartPlaybackMutation, StartPlaybackMutationVariables>;
export const UpdateCommentDocument = gql`
    mutation UpdateComment($input: UpdateCommentInput!) {
  updateComment(input: $input) {
    id
  }
}
    `;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, options);
      }
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DetailedReviewDocument = gql`
    query DetailedReview($reviewId: ID!) {
  review(id: $reviewId) {
    reviewName
    id
    entityType
    entityId
    createdAt
    creator {
      ...UserWithSpotifyOverview
    }
    entity {
      ... on Album {
        ...DetailedAlbum
      }
      ... on Artist {
        ...DetailedArtist
      }
      ... on Playlist {
        ...DetailedPlaylist
      }
      ... on Track {
        ...DetailedTrack
      }
    }
    collaborators {
      accessLevel
      user {
        ...UserWithSpotifyOverview
      }
    }
  }
}
    ${UserWithSpotifyOverviewFragmentDoc}
${DetailedAlbumFragmentDoc}
${DetailedArtistFragmentDoc}
${DetailedPlaylistFragmentDoc}
${DetailedTrackFragmentDoc}`;

/**
 * __useDetailedReviewQuery__
 *
 * To run a query within a React component, call `useDetailedReviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useDetailedReviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDetailedReviewQuery({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *   },
 * });
 */
export function useDetailedReviewQuery(baseOptions: Apollo.QueryHookOptions<DetailedReviewQuery, DetailedReviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DetailedReviewQuery, DetailedReviewQueryVariables>(DetailedReviewDocument, options);
      }
export function useDetailedReviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DetailedReviewQuery, DetailedReviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DetailedReviewQuery, DetailedReviewQueryVariables>(DetailedReviewDocument, options);
        }
export type DetailedReviewQueryHookResult = ReturnType<typeof useDetailedReviewQuery>;
export type DetailedReviewLazyQueryHookResult = ReturnType<typeof useDetailedReviewLazyQuery>;
export type DetailedReviewQueryResult = Apollo.QueryResult<DetailedReviewQuery, DetailedReviewQueryVariables>;
export const DetailedReviewCommentsDocument = gql`
    query DetailedReviewComments($reviewId: ID!) {
  review(id: $reviewId) {
    comments {
      ...DetailedComment
    }
  }
}
    ${DetailedCommentFragmentDoc}`;

/**
 * __useDetailedReviewCommentsQuery__
 *
 * To run a query within a React component, call `useDetailedReviewCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDetailedReviewCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDetailedReviewCommentsQuery({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *   },
 * });
 */
export function useDetailedReviewCommentsQuery(baseOptions: Apollo.QueryHookOptions<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>(DetailedReviewCommentsDocument, options);
      }
export function useDetailedReviewCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>(DetailedReviewCommentsDocument, options);
        }
export type DetailedReviewCommentsQueryHookResult = ReturnType<typeof useDetailedReviewCommentsQuery>;
export type DetailedReviewCommentsLazyQueryHookResult = ReturnType<typeof useDetailedReviewCommentsLazyQuery>;
export type DetailedReviewCommentsQueryResult = Apollo.QueryResult<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>;
export const ProfileAndReviewsDocument = gql`
    query ProfileAndReviews {
  user {
    id
    spotifyProfile {
      id
      displayName
      images
      numFollowers
    }
    reviews {
      ...ReviewOverview
    }
  }
}
    ${ReviewOverviewFragmentDoc}`;

/**
 * __useProfileAndReviewsQuery__
 *
 * To run a query within a React component, call `useProfileAndReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfileAndReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfileAndReviewsQuery({
 *   variables: {
 *   },
 * });
 */
export function useProfileAndReviewsQuery(baseOptions?: Apollo.QueryHookOptions<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>(ProfileAndReviewsDocument, options);
      }
export function useProfileAndReviewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>(ProfileAndReviewsDocument, options);
        }
export type ProfileAndReviewsQueryHookResult = ReturnType<typeof useProfileAndReviewsQuery>;
export type ProfileAndReviewsLazyQueryHookResult = ReturnType<typeof useProfileAndReviewsLazyQuery>;
export type ProfileAndReviewsQueryResult = Apollo.QueryResult<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>;
export const AvailableDevicesDocument = gql`
    subscription AvailableDevices {
  availableDevices {
    ...PlaybackDevice
  }
}
    ${PlaybackDeviceFragmentDoc}`;

/**
 * __useAvailableDevicesSubscription__
 *
 * To run a query within a React component, call `useAvailableDevicesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAvailableDevicesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAvailableDevicesSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAvailableDevicesSubscription(baseOptions?: Apollo.SubscriptionHookOptions<AvailableDevicesSubscription, AvailableDevicesSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AvailableDevicesSubscription, AvailableDevicesSubscriptionVariables>(AvailableDevicesDocument, options);
      }
export type AvailableDevicesSubscriptionHookResult = ReturnType<typeof useAvailableDevicesSubscription>;
export type AvailableDevicesSubscriptionResult = Apollo.SubscriptionResult<AvailableDevicesSubscription>;
export const NowPlayingDocument = gql`
    subscription NowPlaying($input: Int!) {
  nowPlaying(tickInterval: $input) {
    ...PlaybackState
  }
}
    ${PlaybackStateFragmentDoc}`;

/**
 * __useNowPlayingSubscription__
 *
 * To run a query within a React component, call `useNowPlayingSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNowPlayingSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNowPlayingSubscription({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useNowPlayingSubscription(baseOptions: Apollo.SubscriptionHookOptions<NowPlayingSubscription, NowPlayingSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NowPlayingSubscription, NowPlayingSubscriptionVariables>(NowPlayingDocument, options);
      }
export type NowPlayingSubscriptionHookResult = ReturnType<typeof useNowPlayingSubscription>;
export type NowPlayingSubscriptionResult = Apollo.SubscriptionResult<NowPlayingSubscription>;
export const NowPlayingOffsetDocument = gql`
    subscription NowPlayingOffset($input: Int!) {
  nowPlaying(tickInterval: $input) {
    timestamp
    progressMs
    item {
      id
      durationMs
    }
  }
}
    `;

/**
 * __useNowPlayingOffsetSubscription__
 *
 * To run a query within a React component, call `useNowPlayingOffsetSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNowPlayingOffsetSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNowPlayingOffsetSubscription({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useNowPlayingOffsetSubscription(baseOptions: Apollo.SubscriptionHookOptions<NowPlayingOffsetSubscription, NowPlayingOffsetSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<NowPlayingOffsetSubscription, NowPlayingOffsetSubscriptionVariables>(NowPlayingOffsetDocument, options);
      }
export type NowPlayingOffsetSubscriptionHookResult = ReturnType<typeof useNowPlayingOffsetSubscription>;
export type NowPlayingOffsetSubscriptionResult = Apollo.SubscriptionResult<NowPlayingOffsetSubscription>;
export const ReviewUpdatesDocument = gql`
    subscription ReviewUpdates($reviewId: ID!) {
  reviewUpdates(reviewId: $reviewId) {
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
    ${DetailedCommentFragmentDoc}`;

/**
 * __useReviewUpdatesSubscription__
 *
 * To run a query within a React component, call `useReviewUpdatesSubscription` and pass it any options that fit your needs.
 * When your component renders, `useReviewUpdatesSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReviewUpdatesSubscription({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *   },
 * });
 */
export function useReviewUpdatesSubscription(baseOptions: Apollo.SubscriptionHookOptions<ReviewUpdatesSubscription, ReviewUpdatesSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ReviewUpdatesSubscription, ReviewUpdatesSubscriptionVariables>(ReviewUpdatesDocument, options);
      }
export type ReviewUpdatesSubscriptionHookResult = ReturnType<typeof useReviewUpdatesSubscription>;
export type ReviewUpdatesSubscriptionResult = Apollo.SubscriptionResult<ReviewUpdatesSubscription>;