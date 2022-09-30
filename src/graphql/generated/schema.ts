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
  Instant: any;
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

export type DeleteCommentInput = {
  commentId: Scalars['Int'];
  reviewId: Scalars['ID'];
};

export type DeleteReviewInput = {
  id: Scalars['ID'];
};

export enum EntityType {
  Album = 'Album',
  Artist = 'Artist',
  Playlist = 'Playlist',
  Track = 'Track'
}

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
  shareReview?: Maybe<Scalars['Boolean']>;
  updateComment?: Maybe<Scalars['Boolean']>;
  updateReview?: Maybe<Scalars['Boolean']>;
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


export type MutationsShareReviewArgs = {
  input: ShareReviewInput;
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
};

export type PlaylistTrack = {
  __typename?: 'PlaylistTrack';
  addedAt: Scalars['Instant'];
  addedBy: User;
  isLocal: Scalars['Boolean'];
  track: Track;
};

export type Queries = {
  __typename?: 'Queries';
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
};

export type SearchResult = {
  __typename?: 'SearchResult';
  albums: Array<Album>;
  artists: Array<Artist>;
  playlists: Array<Playlist>;
  tracks: Array<Track>;
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

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  reviews?: Maybe<Array<Review>>;
  spotifyProfile?: Maybe<SpotifyProfile>;
};

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutations', createComment?: { __typename?: 'Comment', id: number, createdAt: any, updatedAt: any } | null };

export type CreateReviewMutationVariables = Exact<{
  input: CreateReviewInput;
}>;


export type CreateReviewMutation = { __typename?: 'Mutations', createReview?: { __typename?: 'Review', entityType: EntityType, id: string } | null };

export type DeleteCommentMutationVariables = Exact<{
  input: DeleteCommentInput;
}>;


export type DeleteCommentMutation = { __typename?: 'Mutations', deleteComment?: boolean | null };

export type DetailedReviewQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type DetailedReviewQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: any, creator: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, comments?: Array<{ __typename?: 'Comment', id: number, reviewId: string, createdAt: any, updatedAt: any, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null } | null }> | null, entity: { __typename?: 'Album', albumGroup?: string | null, albumType: string, genres: Array<string>, id: string, images: Array<string>, label?: string | null, name: string, releaseDate: string, albumPopularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null, tracks?: Array<{ __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null }> | null } | { __typename?: 'Artist', numFollowers: number, genres: Array<string>, href: string, id: string, images: Array<string>, name: string, artistPopularity: number } | { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, tracks?: Array<{ __typename?: 'PlaylistTrack', addedAt: any, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, track: { __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null } | { __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null }, collaborators?: Array<{ __typename?: 'Collaborator', accessLevel: AccessLevel, user: { __typename?: 'User', id: string } }> | null } | null };

export type UserIdAndDisplayNameFragment = { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null };

export type DetailedTrackFragment = { __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

export type DetailedPlaylistFragment = { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, tracks?: Array<{ __typename?: 'PlaylistTrack', addedAt: any, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, track: { __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null };

export type DetailedPlaylistTrackFragment = { __typename?: 'PlaylistTrack', addedAt: any, addedBy: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, track: { __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } };

export type DetailedAlbumFragment = { __typename?: 'Album', albumGroup?: string | null, albumType: string, genres: Array<string>, id: string, images: Array<string>, label?: string | null, name: string, releaseDate: string, albumPopularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null, tracks?: Array<{ __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null }> | null };

export type DetailedArtistFragment = { __typename?: 'Artist', numFollowers: number, genres: Array<string>, href: string, id: string, images: Array<string>, name: string, artistPopularity: number };

export type DetailedCommentFragment = { __typename?: 'Comment', id: number, reviewId: string, createdAt: any, updatedAt: any, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null } | null };

export type DetailedReviewCommentsQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type DetailedReviewCommentsQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', comments?: Array<{ __typename?: 'Comment', id: number, reviewId: string, createdAt: any, updatedAt: any, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null } | null }> | null } | null };

export type ProfileAndReviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileAndReviewsQuery = { __typename?: 'Queries', user?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null, reviews?: Array<{ __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: any, entity: { __typename?: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename?: 'Artist', images: Array<string>, id: string, name: string } | { __typename?: 'Playlist', images: Array<string>, id: string, name: string } | { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } }> | null } | null };

export type ReviewOverviewFragment = { __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: any, entity: { __typename?: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename?: 'Artist', images: Array<string>, id: string, name: string } | { __typename?: 'Playlist', images: Array<string>, id: string, name: string } | { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } };

type ReviewEntityOverview_Album_Fragment = { __typename?: 'Album', images: Array<string>, id: string, name: string, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

type ReviewEntityOverview_Artist_Fragment = { __typename?: 'Artist', images: Array<string>, id: string, name: string };

type ReviewEntityOverview_Playlist_Fragment = { __typename?: 'Playlist', images: Array<string>, id: string, name: string };

type ReviewEntityOverview_Track_Fragment = { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null };

export type ReviewEntityOverviewFragment = ReviewEntityOverview_Album_Fragment | ReviewEntityOverview_Artist_Fragment | ReviewEntityOverview_Playlist_Fragment | ReviewEntityOverview_Track_Fragment;

export const UserIdAndDisplayNameFragmentDoc = gql`
    fragment UserIdAndDisplayName on User {
  id
  spotifyProfile {
    displayName
  }
}
    `;
export const DetailedTrackFragmentDoc = gql`
    fragment DetailedTrack on Track {
  id
  name
  durationMs
  explicit
  isPlayable
  previewUrl
  popularity
  album {
    images
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
    ...UserIdAndDisplayName
  }
  track {
    ...DetailedTrack
  }
}
    ${UserIdAndDisplayNameFragmentDoc}
${DetailedTrackFragmentDoc}`;
export const DetailedPlaylistFragmentDoc = gql`
    fragment DetailedPlaylist on Playlist {
  collaborative
  description
  id
  images
  name
  owner {
    ...UserIdAndDisplayName
  }
  tracks {
    ...DetailedPlaylistTrack
  }
  primaryColor
  public
}
    ${UserIdAndDisplayNameFragmentDoc}
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
export const DetailedCommentFragmentDoc = gql`
    fragment DetailedComment on Comment {
  id
  reviewId
  createdAt
  updatedAt
  parentCommentId
  commenterId
  commenter {
    ...UserIdAndDisplayName
  }
  comment
  rating
  entityId
  entityType
}
    ${UserIdAndDisplayNameFragmentDoc}`;
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
  entity {
    ...ReviewEntityOverview
  }
}
    ${ReviewEntityOverviewFragmentDoc}`;
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
export const DetailedReviewDocument = gql`
    query DetailedReview($reviewId: ID!) {
  review(id: $reviewId) {
    reviewName
    id
    entityType
    entityId
    createdAt
    creator {
      ...UserIdAndDisplayName
    }
    comments {
      ...DetailedComment
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
        id
      }
    }
  }
}
    ${UserIdAndDisplayNameFragmentDoc}
${DetailedCommentFragmentDoc}
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