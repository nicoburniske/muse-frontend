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

export type Album = {
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

export type Artist = {
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
  updateComment?: Maybe<Scalars['Boolean']>;
  updateReview?: Maybe<Scalars['Boolean']>;
};


export type MutationsCreateCommentArgs = {
  comment?: InputMaybe<Scalars['String']>;
  entityId: Scalars['String'];
  entityType: EntityType;
  parentCommentId?: InputMaybe<Scalars['Int']>;
  rating?: InputMaybe<Scalars['Int']>;
  reviewId: Scalars['ID'];
};


export type MutationsCreateReviewArgs = {
  entityId: Scalars['String'];
  entityType: EntityType;
  isPublic: Scalars['Boolean'];
  name: Scalars['String'];
};


export type MutationsUpdateCommentArgs = {
  comment?: InputMaybe<Scalars['String']>;
  commentId: Scalars['Int'];
  rating?: InputMaybe<Scalars['Int']>;
};


export type MutationsUpdateReviewArgs = {
  isPublic: Scalars['Boolean'];
  name: Scalars['String'];
  reviewId: Scalars['ID'];
};

export type PaginationInput = {
  first: Scalars['Int'];
  from?: Scalars['Int'];
};

export type Playlist = {
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
  comments?: Maybe<Array<Comment>>;
  createdAt: Scalars['Instant'];
  creator: User;
  entity?: Maybe<ReviewEntity>;
  entityId: Scalars['String'];
  entityType: EntityType;
  id: Scalars['ID'];
  isPublic: Scalars['Boolean'];
  reviewName: Scalars['String'];
};

export type ReviewEntity = Album | Artist | Playlist | Track;

export type SearchResult = {
  __typename?: 'SearchResult';
  albums: Array<Album>;
  artists: Array<Artist>;
  playlists: Array<Playlist>;
  tracks: Array<Track>;
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

export type Track = {
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

export type User = {
  __typename?: 'User';
  id: Scalars['String'];
  reviews?: Maybe<Array<Review>>;
  spotifyProfile?: Maybe<SpotifyProfile>;
};

export type ProfileAndReviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProfileAndReviewsQuery = { __typename?: 'Queries', user?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string, displayName?: string | null, images?: Array<string> | null, numFollowers?: number | null } | null, reviews?: Array<{ __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, entity?: { __typename?: 'Album', id: string, name: string, images: Array<string>, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | { __typename?: 'Artist', id: string, name: string, images: Array<string> } | { __typename?: 'Playlist', id: string, name: string, images: Array<string> } | { __typename?: 'Track', id: string, name: string, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null }> | null } | null };

export type ReviewQueryVariables = Exact<{
  reviewId: Scalars['ID'];
}>;


export type ReviewQuery = { __typename?: 'Queries', review?: { __typename?: 'Review', reviewName: string, id: string, entityType: EntityType, entityId: string, createdAt: any, creator: { __typename?: 'User', id: string, displayName?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null }, comments?: Array<{ __typename?: 'Comment', id: number, reviewId: string, createdAt: any, updatedAt: any, parentCommentId?: number | null, commenterId: string, comment?: string | null, rating?: number | null, entityId: string, entityType: EntityType, commenter?: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', displayName?: string | null } | null } | null }> | null, entity?: { __typename?: 'Album', albumGroup?: string | null, albumType: string, genres: Array<string>, id: string, images: Array<string>, label?: string | null, name: string, releaseDate: string, albumPopularity?: number | null, artists?: Array<{ __typename?: 'Artist', id: string, name: string }> | null, tracks?: Array<{ __typename?: 'Track', id: string, name: string, durationMs: number }> | null } | { __typename?: 'Artist', numFollowers: number, genres: Array<string>, href: string, id: string, images: Array<string>, name: string, artistPopularity: number } | { __typename?: 'Playlist', collaborative: boolean, description: string, id: string, images: Array<string>, name: string, primaryColor?: string | null, public?: boolean | null, owner: { __typename?: 'User', id: string, spotifyProfile?: { __typename?: 'SpotifyProfile', id: string } | null } } | { __typename?: 'Track', id: string, name: string, durationMs: number, explicit: boolean, isPlayable?: boolean | null, previewUrl?: string | null, popularity?: number | null, album?: { __typename?: 'Album', images: Array<string> } | null, artists?: Array<{ __typename?: 'Artist', name: string, id: string }> | null } | null } | null };


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
      reviewName
      id
      entityType
      entityId
      entity {
        ... on Album {
          id
          name
          images
          artists {
            name
            id
          }
        }
        ... on Artist {
          id
          name
          images
        }
        ... on Playlist {
          id
          name
          images
        }
        ... on Track {
          id
          name
          album {
            images
          }
          artists {
            name
            id
          }
        }
      }
    }
  }
}
    `;

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
export const ReviewDocument = gql`
    query Review($reviewId: ID!) {
  review(id: $reviewId) {
    reviewName
    id
    entityType
    entityId
    createdAt
    creator {
      id
      displayName: spotifyProfile {
        displayName
      }
    }
    comments {
      id
      reviewId
      createdAt
      updatedAt
      parentCommentId
      commenterId
      commenter {
        id
        spotifyProfile {
          displayName
        }
      }
      comment
      rating
      entityId
      entityType
    }
    entity {
      ... on Album {
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
        }
      }
      ... on Artist {
        numFollowers
        genres
        href
        id
        images
        name
        artistPopularity: popularity
      }
      ... on Playlist {
        collaborative
        description
        id
        images
        name
        owner {
          id
          spotifyProfile {
            id
          }
        }
        primaryColor
        public
      }
      ... on Track {
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
    }
  }
}
    `;

/**
 * __useReviewQuery__
 *
 * To run a query within a React component, call `useReviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useReviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useReviewQuery({
 *   variables: {
 *      reviewId: // value for 'reviewId'
 *   },
 * });
 */
export function useReviewQuery(baseOptions: Apollo.QueryHookOptions<ReviewQuery, ReviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ReviewQuery, ReviewQueryVariables>(ReviewDocument, options);
      }
export function useReviewLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ReviewQuery, ReviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ReviewQuery, ReviewQueryVariables>(ReviewDocument, options);
        }
export type ReviewQueryHookResult = ReturnType<typeof useReviewQuery>;
export type ReviewLazyQueryHookResult = ReturnType<typeof useReviewLazyQuery>;
export type ReviewQueryResult = Apollo.QueryResult<ReviewQuery, ReviewQueryVariables>;