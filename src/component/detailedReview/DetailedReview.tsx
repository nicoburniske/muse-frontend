

import { gql } from '@apollo/client'
import { useReviewQuery } from 'graphql/generated';

gql`query Review($reviewId: ID!) {
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
}`

interface DetailedReviewProps {
  reviewId: string
}
function DetailedReview({ reviewId }: DetailedReviewProps) {
  const { data, loading, error } = useReviewQuery({
    variables: {
      reviewId
    },
  });
  if (data) {
    const review = data.review
    const entity = data.review?.entity
    switch (entity?.__typename) {
      case "Album":
      case "Artist":
      case "Playlist":
      case "Track":
      default:
        return "Error loading"
    }
  }
}
