import { DetailedCommentFragment, DetailedPlaylistFragment, DetailedPlaylistTrackFragment, DetailedTrackFragment, useDetailedReviewQuery } from 'graphql/generated/schema'
import { useParams, useLocation } from "react-router-dom"
import { Alert, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import { useEffect } from 'react'
// import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

interface DetailedReviewProps {
  reviewId: string
}

export default function DetailedReviewPage() {
  const { reviewId } = useParams()

  if (reviewId) {
    return <DetailedReview reviewId={reviewId} />
  } else {
    return (
      <Alert severity="error"> Missing Review ID </Alert >
    )
  }
}

function DetailedReview({ reviewId }: DetailedReviewProps) {
  const { data, loading, error } = useDetailedReviewQuery({
    variables: {
      reviewId
    },
  })
  if (data) {
    // TODO: include header that's common between Detailed components
    // TODO: Create Comment Button? 
    const review = data.review
    const entity = data.review?.entity
    switch (entity?.__typename) {
      // case "Album":
      // case "Artist":
      // case "Track":
      case "Playlist":
        return <DetailedPlaylist playlist={entity} comments={review?.comments ?? []} />
      default:
        return <Alert severity="warning"> Not implemented yet </Alert >
    }
  } if (error) {
    return <Alert severity="error"> Review Doesn't Exist </Alert >
  }
}

interface DetailedPlaylistProps {
  playlist: DetailedPlaylistFragment
  comments: DetailedCommentFragment[]
}

// TODO: Tracks and Comments side by side. Clicking a comment will focus the entity that the comment is applied to.
// Consider two virutalized lists? 
function DetailedPlaylist({ playlist, comments }: DetailedPlaylistProps) {
  const tracks = playlist.tracks ?? []
  const length = tracks.length

  return (
    <List sx={{ bgcolor: 'background.paper' }}>
      {
        tracks.map((t: DetailedPlaylistTrackFragment) =>
          <ListItem key={t.track.id}>
            <ListItemButton>
              <ListItemText primary={`${t.track.name} - ${t.track.artists?.map(a => a.name).join(", ")}`} />
            </ListItemButton>
          </ListItem>
        )
      }
    </List>
  )
}
