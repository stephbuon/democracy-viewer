import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
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
            pt: 5,
            pb: 3,
            flexGrow: 1
          }}
        >
          <Container sx={{ py: 4, maxWidth: '45%' }} maxWidth={false}>
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Democracy Viewer
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Democratizing text-based data analytics and data sharing across the humanities and social sciences
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
        <Container sx={{ py: 4, maxWidth: '90%' }} maxWidth={false}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Search
                  </Typography>
                  <Typography align='center'>
                    Browse available datasets, <br/>pinpoint specific columns & sections
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                <Button href="/datasetsearch" variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Upload
                  </Typography>
                  <Typography align='center'>
                    Upload a local Data Set/ <br />Connect to Datapoint API
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button href="/upload" variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Visualize
                  </Typography>
                  <Typography align='center'>
                    Customize and interact with visualization of analysis
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button href="/graph" variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
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
        <a href="https://github.com/stephbuon/democracy-viewer-demo/tree/main" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            Visit our GitHub Page
        </a>
        </Typography>
      </Box>

      {/* End footer */}
    </ThemeProvider>
  );
}
