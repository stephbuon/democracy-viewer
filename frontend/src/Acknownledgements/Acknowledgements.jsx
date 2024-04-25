import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';


/***To improve***

1 - Pictures for everyone? Would need to store blobs in the database. 
    Maybe we don't need pictures/maybe people don't want pictures.

2 - Actually add bio/contributions for everyone.

3 - Potentially split the students section into different catagories (backend/frontend work/school/other?)

4 - This could all be a database grab (UseEffect) then array.map(Card)

*/

const theme = createTheme();

export default function Acknowledgements() {
  return (


    <ThemeProvider theme={theme}>
      <CssBaseline />

      <main>
        {/* Hero unit */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Acknowledgements
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              This project has been worked on by the following people.
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
            </Stack>
          </Container>
        </Box>

        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h3" align="center" color="text.primary" paragraph>
              Project Sponser
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 4 }} maxWidth="md">

            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Jo Guldi
                </Typography>
                <Typography align='center'>
                    Jo Guldi Bio/Description of contributions.
                </Typography>
                </CardContent>
            </Card>
        </Container>

        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h3" align="center" color="text.primary" paragraph>
              Project Manager
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 4 }} maxWidth="md">

            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Stephanie Buongiorno
                </Typography>
                <Typography align='center'>
                    Stephanie Buongiorno Bio/Description of contributions.
                </Typography>
                </CardContent>
            </Card>
        </Container>

        <>This following section could be split up more!!!</>
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h3" align="center" color="text.primary" paragraph>
              Students
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 4 }} maxWidth="md">

            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Ryan Schaefer
                </Typography>
                <Typography align='center'>
                    Backend Wizard. Loves to kill bugs...programatically.
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Wes Anderson
                </Typography>
                <Typography align='center'>
                    Creates the bugs for Ryan...Not on purpose (hopefully)
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Matt Swigart
                </Typography>
                <Typography align='center'>
                    UI stuff...
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Chris Miller
                </Typography>
                <Typography align='center'>
                    The graphs are gettting to him
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Latifa
                </Typography>
                <Typography align='center'>
                    Latifa Bio/List of contributions
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Francesca La Marca
                </Typography>
                <Typography align='center'>
                    Francesca La Marca Bio/Description of contributions.
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Grace Schultz
                </Typography>
                <Typography align='center'>
                Grace Schultz Bio/Description of contributions.
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Grace Schultz
                </Typography>
                <Typography align='center'>
                    Grace Schultz Bio/Description of contributions.
                </Typography>
                </CardContent>
            </Card>
            <Card sx={{m:2}}>
                <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="http://via.placeholder.com/400x400"
                >

                </CardMedia>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Hailey DeMark
                </Typography>
                <Typography align='center'>
                    Hailey DeMark Bio/Description of contributions.
                </Typography>
                </CardContent>
            </Card>
        </Container>
      </main>
    </ThemeProvider>
  );
}