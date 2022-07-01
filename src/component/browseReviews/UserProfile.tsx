

import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { ReviewEntityOverviewFragment, ReviewOverviewFragment, useProfileAndReviewsQuery } from 'graphql/generated/schema'
import {
  Box, Button, CardActionArea, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Card, CardContent, CardMedia, Typography
} from '@mui/material';

function groupByN<T>(n: number, data: Array<T>): Array<Array<T>> {
  let result = [];
  for (let i = 0; i < data.length; i += n) result.push(data.slice(i, i + n));
  return result;
};

const TILES_PER_ROW = 6

interface CreateCardProps {
  review: ReviewOverviewFragment
}

function CreateCard ({review}: CreateCardProps){
  const [entityName, image] = getNameAndImage(review.entity)
  const nav = useNavigate()
  const linkToReviewPage = () => nav(`reviews/${review.id}`)
  return (
    <Card key={review.id}>
      <CardActionArea
      onClick={linkToReviewPage}
      >
        <CardMedia
          component="img"
          image={image}
        />
      </CardActionArea>
      <CardContent>
        <Typography
          variant="h5">
          {review.reviewName}
        </Typography>
        <Typography>
          {review.entityType} Review: {entityName}
        </Typography>
      </CardContent>
    </Card>
  )
}

function getNameAndImage(data: ReviewEntityOverviewFragment): [string, string] {
  if ("images" in data) {
    return [data.name, data.images?.[0]]
  } else {
    return [data.name, data.album?.images?.[0] ?? ""]
  }
}

export default function UserProfile() {
  const { data, error, loading } = useProfileAndReviewsQuery()
  const [renderTable, setRenderTable] = useState(true)
  const toggleTable = () => setRenderTable(!renderTable)

  const userDisplayname = data?.user?.spotifyProfile?.displayName ?? data?.user?.id
  const numReviews = data?.user?.reviews?.length ?? 0
  const reviews = data?.user?.reviews ?? []

  const createTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell> Review Name </TableCell>
            <TableCell> Entity Type </TableCell>
            <TableCell> Entity Name </TableCell>
            <TableCell> Created At </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            reviews.map(review => (
              <TableRow key={review.id}>
                <TableCell>{review.reviewName}</TableCell>
                <TableCell>{review.entityType}</TableCell>
                <TableCell>{review?.entity?.name}</TableCell>
                <TableCell>{new Date(review?.createdAt).toDateString()}</TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  )

  const createGrid = () => {
    const grouped = groupByN(TILES_PER_ROW, reviews)
    return (
      <Box p={2}>
        <Grid container spacing={1} >
          {
            grouped.map(row => {
              const hash = row.reduce((acc, r) => acc + r.id, "")
              return (
                <Grid container spacing={3} key={hash}>
                  {row.map(review =>
                    <Grid item xs={2} key={review.id}>
                      <CreateCard review={review}/>
                    </Grid>
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
