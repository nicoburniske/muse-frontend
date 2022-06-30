

import { useState } from 'react'
import { gql } from '@apollo/client'
import { useProfileAndReviewsQuery } from 'graphql/generated'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, Button, CardActionArea } from '@mui/material';

gql`query ProfileAndReviews {
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
  }`

function groupByN<T>(n: number, data: Array<T>): Array<Array<T>> {
  let result = [];
  for (let i = 0; i < data.length; i += n) result.push(data.slice(i, i + n));
  return result;
};

const TILES_PER_ROW = 4

export default function UserProfile() {
  const { data, error, loading } = useProfileAndReviewsQuery()
  const [renderTable, setRenderTable] = useState(true)
  const toggleTable = () => setRenderTable(!renderTable)

  const userDisplayname = data?.user?.spotifyProfile?.displayName ?? data?.user?.id
  const numReviews = data?.user?.reviews?.length ?? 0
  const reviews = data?.user?.reviews ?? []

  const createTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell> Review Name </TableCell>
            <TableCell> Entity Type </TableCell>
            <TableCell> Entity Name </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            reviews.map(review => (
              <TableRow key={review.id}>
                <TableCell>{review.reviewName}</TableCell>
                <TableCell>{review.entityType}</TableCell>
                <TableCell>{review?.entity?.name}</TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  )

  const createCard = (data) => {
    const imageUrl = data?.entity?.images?.[0] ?? data?.entity?.album?.images?.[0]
    return (
      <Card key={data?.reviewId}>
        <CardActionArea>
          <CardMedia
            component="img"
            image={imageUrl}
          />
        </CardActionArea>
        <CardContent>
          <Typography
            variant="h5">
            {data?.reviewName}
          </Typography>
          <Typography>
            {data?.entityType} Review: {data?.entity?.name}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const createGrid = () => {
    const grouped = groupByN(TILES_PER_ROW, reviews)
    return (
      <Box p={2}>
        <Grid container spacing={1}>
          {
            grouped.map(row => {
              const hash = row.reduce((acc, r) => acc + r.id, "")
              return (
                <Grid container spacing={3} key={hash}>
                  {row.map(review =>
                    <Grid item xs={3} key={review.id}>{createCard(review)}</Grid>
                  )}
                </Grid>)
            })
          }
        </Grid>
      </Box>
    )
  }

  if (loading) {
    return <div> Loading User Info </div>
  } else if (error) {
    return (
      <div>
        <div> Request Error: {error?.message} </div>
        <div> GraphQL Errors: {error.graphQLErrors.toString}</div>
        <div> Network Errors: {error.networkError}</div>
      </div>
    )
  } else {
    return (
      <div>
        <div> Welcome {userDisplayname} </div>
        <div> You have {numReviews} reviews! </div>
        <Button onClick={toggleTable} > Toggle Table / Cards </Button>
        <div>{
          renderTable ?
            createTable()
            : createGrid()
        }
        </div>
      </div>
    )
  }
}
