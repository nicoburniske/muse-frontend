import { useMutation, useQuery, useInfiniteQuery, UseMutationOptions, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch("http://localhost:8883/api/graphql", {
    method: "POST",
    ...({"credentials":"include"}),
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0];

      throw new Error(message);
    }

    return json.data;
  }
}
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
  genres?: Maybe<Array<Scalars['String']>>;
  href: Scalars['String'];
  id: Scalars['String'];
  images?: Maybe<Array<Scalars['String']>>;
  name: Scalars['String'];
  numFollowers?: Maybe<Scalars['Int']>;
  popularity?: Maybe<Scalars['Int']>;
  topTracks?: Maybe<Array<Track>>;
  uri: Scalars['String'];
};

export type AudioFeatures = {
  __typename?: 'AudioFeatures';
  acousticness: Scalars['Float'];
  analysisUrl: Scalars['String'];
  danceability: Scalars['Float'];
  durationMs: Scalars['Int'];
  energy: Scalars['Float'];
  id: Scalars['String'];
  instrumentalness: Scalars['Float'];
  key: Scalars['Int'];
  liveness: Scalars['Float'];
  loudness: Scalars['Float'];
  mode: Scalars['Int'];
  speechiness: Scalars['Float'];
  tempo: Scalars['Float'];
  timeSignature: Scalars['Int'];
  trackHref: Scalars['String'];
  type: Scalars['String'];
  uri: Scalars['String'];
  valence: Scalars['Float'];
};

export type Collaborator = {
  __typename?: 'Collaborator';
  accessLevel: AccessLevel;
  user: User;
};

export type Comment = {
  __typename?: 'Comment';
  comment?: Maybe<Scalars['String']>;
  commenter: User;
  createdAt: Scalars['Instant'];
  entities?: Maybe<Array<ReviewEntity>>;
  id: Scalars['Int'];
  parentCommentId?: Maybe<Scalars['Int']>;
  reviewId: Scalars['ID'];
  updatedAt: Scalars['Instant'];
};

export type ContextInput = {
  entityId: Scalars['String'];
  entityType: EntityType;
};

export type CreateCommentInput = {
  comment?: InputMaybe<Scalars['String']>;
  entities: Array<ReviewEntityInput>;
  parentCommentId?: InputMaybe<Scalars['Int']>;
  rating?: InputMaybe<Scalars['Int']>;
  reviewId: Scalars['ID'];
};

export type CreateReviewInput = {
  entity?: InputMaybe<ReviewEntityInput>;
  isPublic: Scalars['Boolean'];
  link?: InputMaybe<InitialLinkInput>;
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

export type InitialLinkInput = {
  parentReviewId: Scalars['ID'];
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
  pausePlayback?: Maybe<Scalars['Boolean']>;
  removeSavedTracks?: Maybe<Scalars['Boolean']>;
  saveTracks?: Maybe<Scalars['Boolean']>;
  seekPlayback?: Maybe<Scalars['Boolean']>;
  shareReview?: Maybe<Scalars['Boolean']>;
  skipToNext?: Maybe<Scalars['Boolean']>;
  skipToPrevious?: Maybe<Scalars['Boolean']>;
  startPlayback?: Maybe<Scalars['Boolean']>;
  toggleShuffle?: Maybe<Scalars['Boolean']>;
  updateComment?: Maybe<Comment>;
  updateReview?: Maybe<Review>;
  updateReviewEntity?: Maybe<Review>;
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


export type MutationsPausePlaybackArgs = {
  deviceId?: InputMaybe<Scalars['String']>;
};


export type MutationsRemoveSavedTracksArgs = {
  input: Array<Scalars['String']>;
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


export type MutationsSkipToNextArgs = {
  deviceId?: InputMaybe<Scalars['String']>;
};


export type MutationsSkipToPreviousArgs = {
  deviceId?: InputMaybe<Scalars['String']>;
};


export type MutationsStartPlaybackArgs = {
  input: PlaybackContextInput;
};


export type MutationsToggleShuffleArgs = {
  input: Scalars['Boolean'];
};


export type MutationsUpdateCommentArgs = {
  input: UpdateCommentInput;
};


export type MutationsUpdateReviewArgs = {
  input: UpdateReviewInput;
};


export type MutationsUpdateReviewEntityArgs = {
  input: UpdateReviewEntityInput;
};

export type PaginationInput = {
  first: Scalars['Int'];
  offset?: Scalars['Int'];
};

export type PaginationResultAlbum = {
  __typename?: 'PaginationResultAlbum';
  items: Array<Album>;
  itemsLeft: Scalars['Int'];
  limit: Scalars['Int'];
  nextOffset?: Maybe<Scalars['Int']>;
};

export type PaginationResultArtist = {
  __typename?: 'PaginationResultArtist';
  items: Array<Artist>;
  itemsLeft: Scalars['Int'];
  limit: Scalars['Int'];
  nextOffset?: Maybe<Scalars['Int']>;
};

export type PaginationResultPlaylist = {
  __typename?: 'PaginationResultPlaylist';
  items: Array<Playlist>;
  itemsLeft: Scalars['Int'];
  limit: Scalars['Int'];
  nextOffset?: Maybe<Scalars['Int']>;
};

export type PaginationResultTrack = {
  __typename?: 'PaginationResultTrack';
  items: Array<Track>;
  itemsLeft: Scalars['Int'];
  limit: Scalars['Int'];
  nextOffset?: Maybe<Scalars['Int']>;
};

export type PlaybackContext = {
  __typename?: 'PlaybackContext';
  externalUrls: Array<KvStringString>;
  href: Scalars['String'];
  metadata?: Maybe<Array<KvStringString>>;
  type: Scalars['String'];
  uri: Scalars['String'];
};

export type PlaybackContextInput = {
  /** If device id is specified, playback will be transferred to that device. Otherwise, playback will be executed on user's active device. */
  deviceId?: InputMaybe<Scalars['String']>;
  entityOffset?: InputMaybe<EntityOffsetInput>;
  positionMs?: InputMaybe<Scalars['Int']>;
  positionOffset?: InputMaybe<PositionOffsetInput>;
  uris?: InputMaybe<Array<Scalars['String']>>;
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
  getPlaylist?: Maybe<Playlist>;
  review?: Maybe<Review>;
  search?: Maybe<SearchResult>;
  user?: Maybe<User>;
};


export type QueriesGetPlaylistArgs = {
  id: Scalars['String'];
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
  childReviews?: Maybe<Array<Review>>;
  collaborators?: Maybe<Array<Collaborator>>;
  comments?: Maybe<Array<Comment>>;
  createdAt: Scalars['Instant'];
  creator: User;
  entity?: Maybe<ReviewEntity>;
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

export type ReviewEntityInput = {
  entityId: Scalars['String'];
  entityType: EntityType;
};

export type ReviewUpdate = CreatedComment | DeletedComment | UpdatedComment;

export type SearchResult = {
  __typename?: 'SearchResult';
  albums?: Maybe<PaginationResultAlbum>;
  artists?: Maybe<PaginationResultArtist>;
  playlists?: Maybe<PaginationResultPlaylist>;
  tracks?: Maybe<PaginationResultTrack>;
};

export type SearchUserPlaylistsInput = {
  pagination: PaginationInput;
  search?: InputMaybe<Scalars['String']>;
};

export type SeekPlaybackInput = {
  deviceId?: InputMaybe<Scalars['String']>;
  positionMs: Scalars['Int'];
};

export type ShareReviewInput = {
  /** If not specified user will have access revoked. */
  accessLevel?: InputMaybe<AccessLevel>;
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
  reviewIds: Array<Scalars['ID']>;
};

export type Track = ReviewEntity & {
  __typename?: 'Track';
  album?: Maybe<Album>;
  artists?: Maybe<Array<Artist>>;
  audioFeatures?: Maybe<AudioFeatures>;
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
  reviewId: Scalars['ID'];
};

export type UpdateReviewEntityInput = {
  entityId: Scalars['String'];
  entityType: EntityType;
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
  playlists?: Maybe<Array<Playlist>>;
  reviews?: Maybe<Array<Review>>;
  spotifyProfile?: Maybe<SpotifyProfile>;
};


export type UserPlaylistsArgs = {
  input: SearchUserPlaylistsInput;
};

export type ReviewDetailsFragment = { __typename?: 'Review', id: string, createdAt: string, reviewName: string, isPublic: boolean, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity?: { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null } | { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } } | { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null, childReviews?: Array<{ __typename?: 'Review', id: string, createdAt: string, reviewName: string, isPublic: boolean, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity?: { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null } | { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } } | { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null }> | null, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null };

export type UserWithSpotifyOverviewFragment = { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null };

type ReviewEntityOverview_Album_Fragment = { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

type ReviewEntityOverview_Artist_Fragment = { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null };

type ReviewEntityOverview_Playlist_Fragment = { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } };

type ReviewEntityOverview_Track_Fragment = { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

export type ReviewEntityOverviewFragment = ReviewEntityOverview_Album_Fragment | ReviewEntityOverview_Artist_Fragment | ReviewEntityOverview_Playlist_Fragment | ReviewEntityOverview_Track_Fragment;

export type CollaboratorFragment = { __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } };

export type DetailedCommentFragment = { __typename?: 'Comment', id: number, reviewId: string, createdAt: string, updatedAt: string, parentCommentId?: number | null, comment?: string | null, commenter: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entities?: Array<{ __typename?: 'Album', id: string } | { __typename?: 'Artist', id: string } | { __typename?: 'Playlist', id: string } | { __typename?: 'Track', id: string }> | null };

export type DetailedPlaylistFragment = { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, tracks?: Array<{ __typename?: 'PlaylistTrack', addedAt: string, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, track: { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null };

export type DetailedPlaylistTrackFragment = { __typename?: 'PlaylistTrack', addedAt: string, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, track: { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } };

export type DetailedTrackFragment = { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

export type SearchPlaylistFragment = { __typename: 'Playlist', id: string, name: string, images: Array<string>, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } };

export type SearchAlbumFragment = { __typename: 'Album', id: string, name: string, images: Array<string>, popularity?: number | null, artists?: Array<{ __typename?: 'Artist', name: string }> | null };

export type PlaybackDeviceFragment = { __typename?: 'PlaybackDevice', id: string, isActive: boolean, isPrivateSession: boolean, isRestricted: boolean, name: string, type: string, volumePercent: number };

export type PlaybackStateFragment = { __typename?: 'PlaybackState', shuffleState: boolean, timestamp: number, progressMs: number, device: { __typename?: 'PlaybackDevice', id: string, name: string }, item?: { __typename?: 'Track', id: string, name: string, durationMs: number, isLiked?: boolean | null, artists?: Array<{ __typename?: 'Artist', name: string }> | null, album?: { __typename?: 'Album', name: string, id: string, images: Array<string> } | null } | null };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutations', createComment?: { __typename?: 'Comment', id: number, createdAt: string, updatedAt: string } | null };

export type CreateReviewMutationVariables = Exact<{
  input: CreateReviewInput;
}>;


export type CreateReviewMutation = { __typename?: 'Mutations', createReview?: { __typename?: 'Review', id: string } | null };

export type DeleteCommentMutationVariables = Exact<{
  input: DeleteCommentInput;
}>;


export type DeleteCommentMutation = { __typename?: 'Mutations', deleteComment?: boolean | null };

export type DeleteReviewMutationVariables = Exact<{
  input: DeleteReviewInput;
}>;


export type DeleteReviewMutation = { __typename?: 'Mutations', deleteReview?: boolean | null };

export type PausePlaybackMutationVariables = Exact<{
  deviceId?: InputMaybe<Scalars['String']>;
}>;


export type PausePlaybackMutation = { __typename?: 'Mutations', pausePlayback?: boolean | null };

export type RemoveSavedTracksMutationVariables = Exact<{
  trackIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type RemoveSavedTracksMutation = { __typename?: 'Mutations', removeSavedTracks?: boolean | null };

export type SaveTracksMutationVariables = Exact<{
  trackIds: Array<Scalars['String']> | Scalars['String'];
}>;


export type SaveTracksMutation = { __typename?: 'Mutations', saveTracks?: boolean | null };

export type SeekPlaybackMutationVariables = Exact<{
  input: SeekPlaybackInput;
}>;


export type SeekPlaybackMutation = { __typename?: 'Mutations', seekPlayback?: boolean | null };

export type ShareReviewMutationVariables = Exact<{
  input: ShareReviewInput;
}>;


export type ShareReviewMutation = { __typename?: 'Mutations', shareReview?: boolean | null };

export type ToggleShuffleMutationVariables = Exact<{
  input: Scalars['Boolean'];
}>;


export type ToggleShuffleMutation = { __typename?: 'Mutations', toggleShuffle?: boolean | null };

export type SkipToNextMutationVariables = Exact<{
  deviceId?: InputMaybe<Scalars['String']>;
}>;


export type SkipToNextMutation = { __typename?: 'Mutations', skipToNext?: boolean | null };

export type SkipToPreviousMutationVariables = Exact<{
  deviceId?: InputMaybe<Scalars['String']>;
}>;


export type SkipToPreviousMutation = { __typename?: 'Mutations', skipToPrevious?: boolean | null };

export type StartPlaybackMutationVariables = Exact<{
  input: PlaybackContextInput;
}>;


export type StartPlaybackMutation = { __typename?: 'Mutations', startPlayback?: boolean | null };

export type UpdateCommentMutationVariables = Exact<{
  input: UpdateCommentInput;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutations', updateComment?: { __typename?: 'Comment', id: number } | null };

export type UpdateReviewMutationVariables = Exact<{
  input: UpdateReviewInput;
}>;


export type UpdateReviewMutation = { __typename?: 'Mutations', updateReview?: { __typename?: 'Review', id: string } | null };

export type DetailedReviewQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type DetailedReviewQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', id: string, createdAt: string, reviewName: string, isPublic: boolean, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity?: { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null } | { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } } | { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null, childReviews?: Array<{ __typename?: 'Review', id: string, createdAt: string, reviewName: string, isPublic: boolean, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity?: { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null } | { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } } | { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null }> | null, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null } | null };

export type DetailedReviewCommentsQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type DetailedReviewCommentsQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', comments?: Array<{ __typename?: 'Comment', id: number, reviewId: string, createdAt: string, updatedAt: string, parentCommentId?: number | null, comment?: string | null, commenter: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entities?: Array<{ __typename?: 'Album', id: string } | { __typename?: 'Artist', id: string } | { __typename?: 'Playlist', id: string } | { __typename?: 'Track', id: string }> | null }> | null } | null };

export type GetPlaylistQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetPlaylistQuery = { __typename?: 'Queries', getPlaylist?: { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, tracks?: Array<{ __typename?: 'PlaylistTrack', addedAt: string, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, track: { __typename?: 'Track', uri: string, id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string>, id: string } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null } | null };

export type ProfileAndReviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileAndReviewsQuery = { __typename?: 'Queries', user?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null, reviews?: Array<{ __typename?: 'Review', id: string, createdAt: string, reviewName: string, isPublic: boolean, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity?: { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null } | { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } } | { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null, childReviews?: Array<{ __typename?: 'Review', id: string, createdAt: string, reviewName: string, isPublic: boolean, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null }, entity?: { __typename: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename: 'Artist', id: string, name: string, artistImages?: Array<string> | null } | { __typename: 'Playlist', images: Array<string>, id: string, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null } } | { __typename: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null }> | null, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null }> | null } | null };

export type SearchSpotifyQueryVariables = Exact<{
  query: Scalars['String'];
  types: Array<EntityType> | EntityType;
  pagination?: InputMaybe<PaginationInput>;
}>;


export type SearchSpotifyQuery = { __typename?: 'Queries', search?: { __typename?: 'SearchResult', playlists?: { __typename?: 'PaginationResultPlaylist', limit: number, nextOffset?: number | null, itemsLeft: number, items: Array<{ __typename: 'Playlist', id: string, name: string, images: Array<string>, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> } | null, albums?: { __typename?: 'PaginationResultAlbum', limit: number, nextOffset?: number | null, itemsLeft: number, items: Array<{ __typename: 'Album', id: string, name: string, images: Array<string>, popularity?: number | null, artists?: Array<{ __typename?: 'Artist', name: string }> | null }> } | null } | null };

export type UserPlaylistsQueryVariables = Exact<{
  input: SearchUserPlaylistsInput;
}>;


export type UserPlaylistsQuery = { __typename?: 'Queries', user?: { __typename?: 'User', id: string, playlists?: Array<{ __typename?: 'Playlist', id: string, images: Array<string>, name: string, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null, images?: Array<string> | null } | null } }> | null } | null };

export type AvailableDevicesSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AvailableDevicesSubscription = { __typename?: 'Subscriptions', availableDevices?: Array<{ __typename?: 'PlaybackDevice', id: string, isActive: boolean, isPrivateSession: boolean, isRestricted: boolean, name: string, type: string, volumePercent: number }> | null };

export type NowPlayingSubscriptionVariables = Exact<{
  input: Scalars['Int'];
}>;


export type NowPlayingSubscription = { __typename?: 'Subscriptions', nowPlaying?: { __typename?: 'PlaybackState', shuffleState: boolean, timestamp: number, progressMs: number, device: { __typename?: 'PlaybackDevice', id: string, name: string }, item?: { __typename?: 'Track', id: string, name: string, durationMs: number, isLiked?: boolean | null, artists?: Array<{ __typename?: 'Artist', name: string }> | null, album?: { __typename?: 'Album', name: string, id: string, images: Array<string> } | null } | null } | null };

export type NowPlayingOffsetSubscriptionVariables = Exact<{
  input: Scalars['Int'];
}>;


export type NowPlayingOffsetSubscription = { __typename?: 'Subscriptions', nowPlaying?: { __typename?: 'PlaybackState', timestamp: number, progressMs: number, isPlaying: boolean, shuffleState: boolean, item?: { __typename?: 'Track', id: string, durationMs: number, name: string, isLiked?: boolean | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null, album?: { __typename?: 'Album', name: string, images: Array<string> } | null } | null } | null };

export const DetailedAlbumFragmentDoc = `
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
export const DetailedArtistFragmentDoc = `
    fragment DetailedArtist on Artist {
  numFollowers
  artistGenres: genres
  href
  id
  artistImages: images
  name
  artistPopularity: popularity
}
    `;
export const UserWithSpotifyOverviewFragmentDoc = `
    fragment UserWithSpotifyOverview on User {
  id
  spotifyProfile {
    displayName
    images
  }
}
    `;
export const DetailedTrackFragmentDoc = `
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
export const DetailedPlaylistTrackFragmentDoc = `
    fragment DetailedPlaylistTrack on PlaylistTrack {
  addedAt
  addedBy {
    ...UserWithSpotifyOverview
  }
  track {
    ...DetailedTrack
  }
}
    `;
export const DetailedPlaylistFragmentDoc = `
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
    `;
export const DetailedCommentFragmentDoc = `
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
    id
  }
}
    `;
export const ReviewEntityOverviewFragmentDoc = `
    fragment ReviewEntityOverview on ReviewEntity {
  __typename
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
    artists {
      name
      id
    }
  }
}
    `;
export const CollaboratorFragmentDoc = `
    fragment Collaborator on Collaborator {
  accessLevel
  user {
    ...UserWithSpotifyOverview
  }
}
    `;
export const ReviewDetailsFragmentDoc = `
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
    `;
export const SearchAlbumFragmentDoc = `
    fragment SearchAlbum on Album {
  __typename
  id
  name
  images
  popularity
  artists {
    name
  }
}
    `;
export const SearchPlaylistFragmentDoc = `
    fragment SearchPlaylist on Playlist {
  __typename
  id
  name
  images
  owner {
    ...UserWithSpotifyOverview
  }
}
    `;
export const PlaybackDeviceFragmentDoc = `
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
export const PlaybackStateFragmentDoc = `
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
export const CreateCommentDocument = `
    mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    id
    createdAt
    updatedAt
  }
}
    `;
export const useCreateCommentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateCommentMutation, TError, CreateCommentMutationVariables, TContext>) =>
    useMutation<CreateCommentMutation, TError, CreateCommentMutationVariables, TContext>(
      ['CreateComment'],
      (variables?: CreateCommentMutationVariables) => fetcher<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, variables)(),
      options
    );
useCreateCommentMutation.fetcher = (variables: CreateCommentMutationVariables) => fetcher<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, variables);
export const CreateReviewDocument = `
    mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    id
  }
}
    `;
export const useCreateReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateReviewMutation, TError, CreateReviewMutationVariables, TContext>) =>
    useMutation<CreateReviewMutation, TError, CreateReviewMutationVariables, TContext>(
      ['CreateReview'],
      (variables?: CreateReviewMutationVariables) => fetcher<CreateReviewMutation, CreateReviewMutationVariables>(CreateReviewDocument, variables)(),
      options
    );
useCreateReviewMutation.fetcher = (variables: CreateReviewMutationVariables) => fetcher<CreateReviewMutation, CreateReviewMutationVariables>(CreateReviewDocument, variables);
export const DeleteCommentDocument = `
    mutation DeleteComment($input: DeleteCommentInput!) {
  deleteComment(input: $input)
}
    `;
export const useDeleteCommentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteCommentMutation, TError, DeleteCommentMutationVariables, TContext>) =>
    useMutation<DeleteCommentMutation, TError, DeleteCommentMutationVariables, TContext>(
      ['DeleteComment'],
      (variables?: DeleteCommentMutationVariables) => fetcher<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, variables)(),
      options
    );
useDeleteCommentMutation.fetcher = (variables: DeleteCommentMutationVariables) => fetcher<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, variables);
export const DeleteReviewDocument = `
    mutation DeleteReview($input: DeleteReviewInput!) {
  deleteReview(input: $input)
}
    `;
export const useDeleteReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteReviewMutation, TError, DeleteReviewMutationVariables, TContext>) =>
    useMutation<DeleteReviewMutation, TError, DeleteReviewMutationVariables, TContext>(
      ['DeleteReview'],
      (variables?: DeleteReviewMutationVariables) => fetcher<DeleteReviewMutation, DeleteReviewMutationVariables>(DeleteReviewDocument, variables)(),
      options
    );
useDeleteReviewMutation.fetcher = (variables: DeleteReviewMutationVariables) => fetcher<DeleteReviewMutation, DeleteReviewMutationVariables>(DeleteReviewDocument, variables);
export const PausePlaybackDocument = `
    mutation PausePlayback($deviceId: String) {
  pausePlayback(deviceId: $deviceId)
}
    `;
export const usePausePlaybackMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<PausePlaybackMutation, TError, PausePlaybackMutationVariables, TContext>) =>
    useMutation<PausePlaybackMutation, TError, PausePlaybackMutationVariables, TContext>(
      ['PausePlayback'],
      (variables?: PausePlaybackMutationVariables) => fetcher<PausePlaybackMutation, PausePlaybackMutationVariables>(PausePlaybackDocument, variables)(),
      options
    );
usePausePlaybackMutation.fetcher = (variables?: PausePlaybackMutationVariables) => fetcher<PausePlaybackMutation, PausePlaybackMutationVariables>(PausePlaybackDocument, variables);
export const RemoveSavedTracksDocument = `
    mutation RemoveSavedTracks($trackIds: [String!]!) {
  removeSavedTracks(input: $trackIds)
}
    `;
export const useRemoveSavedTracksMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveSavedTracksMutation, TError, RemoveSavedTracksMutationVariables, TContext>) =>
    useMutation<RemoveSavedTracksMutation, TError, RemoveSavedTracksMutationVariables, TContext>(
      ['RemoveSavedTracks'],
      (variables?: RemoveSavedTracksMutationVariables) => fetcher<RemoveSavedTracksMutation, RemoveSavedTracksMutationVariables>(RemoveSavedTracksDocument, variables)(),
      options
    );
useRemoveSavedTracksMutation.fetcher = (variables: RemoveSavedTracksMutationVariables) => fetcher<RemoveSavedTracksMutation, RemoveSavedTracksMutationVariables>(RemoveSavedTracksDocument, variables);
export const SaveTracksDocument = `
    mutation SaveTracks($trackIds: [String!]!) {
  saveTracks(input: $trackIds)
}
    `;
export const useSaveTracksMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SaveTracksMutation, TError, SaveTracksMutationVariables, TContext>) =>
    useMutation<SaveTracksMutation, TError, SaveTracksMutationVariables, TContext>(
      ['SaveTracks'],
      (variables?: SaveTracksMutationVariables) => fetcher<SaveTracksMutation, SaveTracksMutationVariables>(SaveTracksDocument, variables)(),
      options
    );
useSaveTracksMutation.fetcher = (variables: SaveTracksMutationVariables) => fetcher<SaveTracksMutation, SaveTracksMutationVariables>(SaveTracksDocument, variables);
export const SeekPlaybackDocument = `
    mutation SeekPlayback($input: SeekPlaybackInput!) {
  seekPlayback(input: $input)
}
    `;
export const useSeekPlaybackMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SeekPlaybackMutation, TError, SeekPlaybackMutationVariables, TContext>) =>
    useMutation<SeekPlaybackMutation, TError, SeekPlaybackMutationVariables, TContext>(
      ['SeekPlayback'],
      (variables?: SeekPlaybackMutationVariables) => fetcher<SeekPlaybackMutation, SeekPlaybackMutationVariables>(SeekPlaybackDocument, variables)(),
      options
    );
useSeekPlaybackMutation.fetcher = (variables: SeekPlaybackMutationVariables) => fetcher<SeekPlaybackMutation, SeekPlaybackMutationVariables>(SeekPlaybackDocument, variables);
export const ShareReviewDocument = `
    mutation ShareReview($input: ShareReviewInput!) {
  shareReview(input: $input)
}
    `;
export const useShareReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ShareReviewMutation, TError, ShareReviewMutationVariables, TContext>) =>
    useMutation<ShareReviewMutation, TError, ShareReviewMutationVariables, TContext>(
      ['ShareReview'],
      (variables?: ShareReviewMutationVariables) => fetcher<ShareReviewMutation, ShareReviewMutationVariables>(ShareReviewDocument, variables)(),
      options
    );
useShareReviewMutation.fetcher = (variables: ShareReviewMutationVariables) => fetcher<ShareReviewMutation, ShareReviewMutationVariables>(ShareReviewDocument, variables);
export const ToggleShuffleDocument = `
    mutation ToggleShuffle($input: Boolean!) {
  toggleShuffle(input: $input)
}
    `;
export const useToggleShuffleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ToggleShuffleMutation, TError, ToggleShuffleMutationVariables, TContext>) =>
    useMutation<ToggleShuffleMutation, TError, ToggleShuffleMutationVariables, TContext>(
      ['ToggleShuffle'],
      (variables?: ToggleShuffleMutationVariables) => fetcher<ToggleShuffleMutation, ToggleShuffleMutationVariables>(ToggleShuffleDocument, variables)(),
      options
    );
useToggleShuffleMutation.fetcher = (variables: ToggleShuffleMutationVariables) => fetcher<ToggleShuffleMutation, ToggleShuffleMutationVariables>(ToggleShuffleDocument, variables);
export const SkipToNextDocument = `
    mutation SkipToNext($deviceId: String) {
  skipToNext(deviceId: $deviceId)
}
    `;
export const useSkipToNextMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SkipToNextMutation, TError, SkipToNextMutationVariables, TContext>) =>
    useMutation<SkipToNextMutation, TError, SkipToNextMutationVariables, TContext>(
      ['SkipToNext'],
      (variables?: SkipToNextMutationVariables) => fetcher<SkipToNextMutation, SkipToNextMutationVariables>(SkipToNextDocument, variables)(),
      options
    );
useSkipToNextMutation.fetcher = (variables?: SkipToNextMutationVariables) => fetcher<SkipToNextMutation, SkipToNextMutationVariables>(SkipToNextDocument, variables);
export const SkipToPreviousDocument = `
    mutation SkipToPrevious($deviceId: String) {
  skipToPrevious(deviceId: $deviceId)
}
    `;
export const useSkipToPreviousMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SkipToPreviousMutation, TError, SkipToPreviousMutationVariables, TContext>) =>
    useMutation<SkipToPreviousMutation, TError, SkipToPreviousMutationVariables, TContext>(
      ['SkipToPrevious'],
      (variables?: SkipToPreviousMutationVariables) => fetcher<SkipToPreviousMutation, SkipToPreviousMutationVariables>(SkipToPreviousDocument, variables)(),
      options
    );
useSkipToPreviousMutation.fetcher = (variables?: SkipToPreviousMutationVariables) => fetcher<SkipToPreviousMutation, SkipToPreviousMutationVariables>(SkipToPreviousDocument, variables);
export const StartPlaybackDocument = `
    mutation StartPlayback($input: PlaybackContextInput!) {
  startPlayback(input: $input)
}
    `;
export const useStartPlaybackMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<StartPlaybackMutation, TError, StartPlaybackMutationVariables, TContext>) =>
    useMutation<StartPlaybackMutation, TError, StartPlaybackMutationVariables, TContext>(
      ['StartPlayback'],
      (variables?: StartPlaybackMutationVariables) => fetcher<StartPlaybackMutation, StartPlaybackMutationVariables>(StartPlaybackDocument, variables)(),
      options
    );
useStartPlaybackMutation.fetcher = (variables: StartPlaybackMutationVariables) => fetcher<StartPlaybackMutation, StartPlaybackMutationVariables>(StartPlaybackDocument, variables);
export const UpdateCommentDocument = `
    mutation UpdateComment($input: UpdateCommentInput!) {
  updateComment(input: $input) {
    id
  }
}
    `;
export const useUpdateCommentMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateCommentMutation, TError, UpdateCommentMutationVariables, TContext>) =>
    useMutation<UpdateCommentMutation, TError, UpdateCommentMutationVariables, TContext>(
      ['UpdateComment'],
      (variables?: UpdateCommentMutationVariables) => fetcher<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, variables)(),
      options
    );
useUpdateCommentMutation.fetcher = (variables: UpdateCommentMutationVariables) => fetcher<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, variables);
export const UpdateReviewDocument = `
    mutation UpdateReview($input: UpdateReviewInput!) {
  updateReview(input: $input) {
    id
  }
}
    `;
export const useUpdateReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateReviewMutation, TError, UpdateReviewMutationVariables, TContext>) =>
    useMutation<UpdateReviewMutation, TError, UpdateReviewMutationVariables, TContext>(
      ['UpdateReview'],
      (variables?: UpdateReviewMutationVariables) => fetcher<UpdateReviewMutation, UpdateReviewMutationVariables>(UpdateReviewDocument, variables)(),
      options
    );
useUpdateReviewMutation.fetcher = (variables: UpdateReviewMutationVariables) => fetcher<UpdateReviewMutation, UpdateReviewMutationVariables>(UpdateReviewDocument, variables);
export const DetailedReviewDocument = `
    query DetailedReview($reviewId: ID!) {
  review(id: $reviewId) {
    ...ReviewDetails
  }
}
    ${ReviewDetailsFragmentDoc}
${UserWithSpotifyOverviewFragmentDoc}
${ReviewEntityOverviewFragmentDoc}
${CollaboratorFragmentDoc}`;
export const useDetailedReviewQuery = <
      TData = DetailedReviewQuery,
      TError = unknown
    >(
      variables: DetailedReviewQueryVariables,
      options?: UseQueryOptions<DetailedReviewQuery, TError, TData>
    ) =>
    useQuery<DetailedReviewQuery, TError, TData>(
      ['DetailedReview', variables],
      fetcher<DetailedReviewQuery, DetailedReviewQueryVariables>(DetailedReviewDocument, variables),
      options
    );
export const useInfiniteDetailedReviewQuery = <
      TData = DetailedReviewQuery,
      TError = unknown
    >(
      pageParamKey: keyof DetailedReviewQueryVariables,
      variables: DetailedReviewQueryVariables,
      options?: UseInfiniteQueryOptions<DetailedReviewQuery, TError, TData>
    ) =>
    useInfiniteQuery<DetailedReviewQuery, TError, TData>(
      ['DetailedReview.infinite', variables],
      (metaData) => fetcher<DetailedReviewQuery, DetailedReviewQueryVariables>(DetailedReviewDocument, {...variables, [pageParamKey]: metaData.pageParam })(),
      options
    );

useDetailedReviewQuery.fetcher = (variables: DetailedReviewQueryVariables) => fetcher<DetailedReviewQuery, DetailedReviewQueryVariables>(DetailedReviewDocument, variables);
export const DetailedReviewCommentsDocument = `
    query DetailedReviewComments($reviewId: ID!) {
  review(id: $reviewId) {
    comments {
      ...DetailedComment
    }
  }
}
    ${DetailedCommentFragmentDoc}
${UserWithSpotifyOverviewFragmentDoc}`;
export const useDetailedReviewCommentsQuery = <
      TData = DetailedReviewCommentsQuery,
      TError = unknown
    >(
      variables: DetailedReviewCommentsQueryVariables,
      options?: UseQueryOptions<DetailedReviewCommentsQuery, TError, TData>
    ) =>
    useQuery<DetailedReviewCommentsQuery, TError, TData>(
      ['DetailedReviewComments', variables],
      fetcher<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>(DetailedReviewCommentsDocument, variables),
      options
    );
export const useInfiniteDetailedReviewCommentsQuery = <
      TData = DetailedReviewCommentsQuery,
      TError = unknown
    >(
      pageParamKey: keyof DetailedReviewCommentsQueryVariables,
      variables: DetailedReviewCommentsQueryVariables,
      options?: UseInfiniteQueryOptions<DetailedReviewCommentsQuery, TError, TData>
    ) =>
    useInfiniteQuery<DetailedReviewCommentsQuery, TError, TData>(
      ['DetailedReviewComments.infinite', variables],
      (metaData) => fetcher<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>(DetailedReviewCommentsDocument, {...variables, [pageParamKey]: metaData.pageParam })(),
      options
    );

useDetailedReviewCommentsQuery.fetcher = (variables: DetailedReviewCommentsQueryVariables) => fetcher<DetailedReviewCommentsQuery, DetailedReviewCommentsQueryVariables>(DetailedReviewCommentsDocument, variables);
export const GetPlaylistDocument = `
    query GetPlaylist($id: String!) {
  getPlaylist(id: $id) {
    ...DetailedPlaylist
  }
}
    ${DetailedPlaylistFragmentDoc}
${UserWithSpotifyOverviewFragmentDoc}
${DetailedPlaylistTrackFragmentDoc}
${DetailedTrackFragmentDoc}`;
export const useGetPlaylistQuery = <
      TData = GetPlaylistQuery,
      TError = unknown
    >(
      variables: GetPlaylistQueryVariables,
      options?: UseQueryOptions<GetPlaylistQuery, TError, TData>
    ) =>
    useQuery<GetPlaylistQuery, TError, TData>(
      ['GetPlaylist', variables],
      fetcher<GetPlaylistQuery, GetPlaylistQueryVariables>(GetPlaylistDocument, variables),
      options
    );
export const useInfiniteGetPlaylistQuery = <
      TData = GetPlaylistQuery,
      TError = unknown
    >(
      pageParamKey: keyof GetPlaylistQueryVariables,
      variables: GetPlaylistQueryVariables,
      options?: UseInfiniteQueryOptions<GetPlaylistQuery, TError, TData>
    ) =>
    useInfiniteQuery<GetPlaylistQuery, TError, TData>(
      ['GetPlaylist.infinite', variables],
      (metaData) => fetcher<GetPlaylistQuery, GetPlaylistQueryVariables>(GetPlaylistDocument, {...variables, [pageParamKey]: metaData.pageParam })(),
      options
    );

useGetPlaylistQuery.fetcher = (variables: GetPlaylistQueryVariables) => fetcher<GetPlaylistQuery, GetPlaylistQueryVariables>(GetPlaylistDocument, variables);
export const ProfileAndReviewsDocument = `
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
      ...ReviewDetails
    }
  }
}
    ${ReviewDetailsFragmentDoc}
${UserWithSpotifyOverviewFragmentDoc}
${ReviewEntityOverviewFragmentDoc}
${CollaboratorFragmentDoc}`;
export const useProfileAndReviewsQuery = <
      TData = ProfileAndReviewsQuery,
      TError = unknown
    >(
      variables?: ProfileAndReviewsQueryVariables,
      options?: UseQueryOptions<ProfileAndReviewsQuery, TError, TData>
    ) =>
    useQuery<ProfileAndReviewsQuery, TError, TData>(
      variables === undefined ? ['ProfileAndReviews'] : ['ProfileAndReviews', variables],
      fetcher<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>(ProfileAndReviewsDocument, variables),
      options
    );
export const useInfiniteProfileAndReviewsQuery = <
      TData = ProfileAndReviewsQuery,
      TError = unknown
    >(
      pageParamKey: keyof ProfileAndReviewsQueryVariables,
      variables?: ProfileAndReviewsQueryVariables,
      options?: UseInfiniteQueryOptions<ProfileAndReviewsQuery, TError, TData>
    ) =>
    useInfiniteQuery<ProfileAndReviewsQuery, TError, TData>(
      variables === undefined ? ['ProfileAndReviews.infinite'] : ['ProfileAndReviews.infinite', variables],
      (metaData) => fetcher<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>(ProfileAndReviewsDocument, {...variables, [pageParamKey]: metaData.pageParam })(),
      options
    );

useProfileAndReviewsQuery.fetcher = (variables?: ProfileAndReviewsQueryVariables) => fetcher<ProfileAndReviewsQuery, ProfileAndReviewsQueryVariables>(ProfileAndReviewsDocument, variables);
export const SearchSpotifyDocument = `
    query SearchSpotify($query: String!, $types: [EntityType!]!, $pagination: PaginationInput) {
  search(query: $query, types: $types, pagination: $pagination) {
    playlists {
      limit
      nextOffset
      itemsLeft
      items {
        ...SearchPlaylist
      }
    }
    albums {
      limit
      nextOffset
      itemsLeft
      items {
        ...SearchAlbum
      }
    }
  }
}
    ${SearchPlaylistFragmentDoc}
${UserWithSpotifyOverviewFragmentDoc}
${SearchAlbumFragmentDoc}`;
export const useSearchSpotifyQuery = <
      TData = SearchSpotifyQuery,
      TError = unknown
    >(
      variables: SearchSpotifyQueryVariables,
      options?: UseQueryOptions<SearchSpotifyQuery, TError, TData>
    ) =>
    useQuery<SearchSpotifyQuery, TError, TData>(
      ['SearchSpotify', variables],
      fetcher<SearchSpotifyQuery, SearchSpotifyQueryVariables>(SearchSpotifyDocument, variables),
      options
    );
export const useInfiniteSearchSpotifyQuery = <
      TData = SearchSpotifyQuery,
      TError = unknown
    >(
      pageParamKey: keyof SearchSpotifyQueryVariables,
      variables: SearchSpotifyQueryVariables,
      options?: UseInfiniteQueryOptions<SearchSpotifyQuery, TError, TData>
    ) =>
    useInfiniteQuery<SearchSpotifyQuery, TError, TData>(
      ['SearchSpotify.infinite', variables],
      (metaData) => fetcher<SearchSpotifyQuery, SearchSpotifyQueryVariables>(SearchSpotifyDocument, {...variables, [pageParamKey]: metaData.pageParam })(),
      options
    );

useSearchSpotifyQuery.fetcher = (variables: SearchSpotifyQueryVariables) => fetcher<SearchSpotifyQuery, SearchSpotifyQueryVariables>(SearchSpotifyDocument, variables);
export const UserPlaylistsDocument = `
    query UserPlaylists($input: SearchUserPlaylistsInput!) {
  user {
    id
    playlists(input: $input) {
      id
      images
      name
      owner {
        ...UserWithSpotifyOverview
      }
    }
  }
}
    ${UserWithSpotifyOverviewFragmentDoc}`;
export const useUserPlaylistsQuery = <
      TData = UserPlaylistsQuery,
      TError = unknown
    >(
      variables: UserPlaylistsQueryVariables,
      options?: UseQueryOptions<UserPlaylistsQuery, TError, TData>
    ) =>
    useQuery<UserPlaylistsQuery, TError, TData>(
      ['UserPlaylists', variables],
      fetcher<UserPlaylistsQuery, UserPlaylistsQueryVariables>(UserPlaylistsDocument, variables),
      options
    );
export const useInfiniteUserPlaylistsQuery = <
      TData = UserPlaylistsQuery,
      TError = unknown
    >(
      pageParamKey: keyof UserPlaylistsQueryVariables,
      variables: UserPlaylistsQueryVariables,
      options?: UseInfiniteQueryOptions<UserPlaylistsQuery, TError, TData>
    ) =>
    useInfiniteQuery<UserPlaylistsQuery, TError, TData>(
      ['UserPlaylists.infinite', variables],
      (metaData) => fetcher<UserPlaylistsQuery, UserPlaylistsQueryVariables>(UserPlaylistsDocument, {...variables, [pageParamKey]: metaData.pageParam })(),
      options
    );

useUserPlaylistsQuery.fetcher = (variables: UserPlaylistsQueryVariables) => fetcher<UserPlaylistsQuery, UserPlaylistsQueryVariables>(UserPlaylistsDocument, variables);
export const AvailableDevicesDocument = `
    subscription AvailableDevices {
  availableDevices {
    ...PlaybackDevice
  }
}
    ${PlaybackDeviceFragmentDoc}`;
export const NowPlayingDocument = `
    subscription NowPlaying($input: Int!) {
  nowPlaying(tickInterval: $input) {
    ...PlaybackState
  }
}
    ${PlaybackStateFragmentDoc}`;
export const NowPlayingOffsetDocument = `
    subscription NowPlayingOffset($input: Int!) {
  nowPlaying(tickInterval: $input) {
    timestamp
    progressMs
    isPlaying
    shuffleState
    item {
      id
      durationMs
      name
      isLiked
      artists {
        id
        name
      }
      album {
        name
        images
      }
    }
  }
}
    `;