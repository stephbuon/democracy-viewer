import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Switch, Route, Redirect, } from "react-router-dom";
import Login from './Login';


//Need to add if logged in to all buttons 


const theme = createTheme();

export default function Homepage() {
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
              Text Mining Development
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              A community to analyze and share data sets. Text Mining Development offers an array of visualization tools to support statistical and close readings of text.
            </Typography>
            <Stack
              sx={{ pt: 0 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
            </Stack>
          </Container>
        </Box>
        <Container sx={{ py: 4 }} maxWidth="md">

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    // 16:9
                    height: 200,
                    width: '100%'
                  }}
                  image={require("../images/search.png")}
                  alt="search image"
                  //image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Search
                  </Typography>
                  <Typography align='center'>
                    Browse Datasets or Conduct an Advanced Search
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button href="/datasetsearch" variant="contained" sx={{ borderRadius: 50 }}>SELECT</Button>
                </CardActions>
              </Card>

            </Grid>

            {/* TEMPORARY FOR VERTICAL SLICE */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    // 16:9
                    height: 200,
                    width: '100%'
                  }}

                  image={require("../images/subset.png")}
                  alt="subset image"
                  //image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Subset
                  </Typography>
                  <Typography align='center'>
                    Find Records in a Dataset
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button href="/subsetsearch" variant="contained" sx={{ borderRadius: 50 }}>SELECT</Button>
                </CardActions>
              </Card>

            </Grid>




            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    // 16:9
                    height: 200,
                    width: '100%'
                  }}
                  image={require("../images/upload.png")}
                  alt="upload image"
                  //image="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_1280.png"
                  //alt="random"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Upload
                  </Typography>
                  <Typography align='center'>
                    Upload a Data Set
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button href="/upload" variant="contained" sx={{ borderRadius: 50 }}>SELECT</Button>
                </CardActions>
              </Card>

            </Grid>

            {/* TEMPORARY FOR VERTICAL SLICE */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    // 16:9
                    height: 200,
                    width: '100%'
                  }}
                  image={require("../images/graph.png")}
                  alt="graph image"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Graph
                  </Typography>
                  <Typography align='center'>
                    View Customizable and Interactive Graphs
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button href="/graph" variant="contained" sx={{ borderRadius: 50 }}>SELECT</Button>
                </CardActions>
              </Card>

            </Grid>




          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          Contact Us
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Something will go here eventually
        </Typography>
      </Box>
      {/* End footer */}
    </ThemeProvider>
  );
}