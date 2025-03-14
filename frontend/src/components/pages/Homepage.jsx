
import { 
  Box, Button, Card, CardActions, CardContent, Container, CssBaseline, Grid, Stack, Typography,
  createTheme, ThemeProvider
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const theme = createTheme();

export const Homepage = () => {
  const navigate = useNavigate();

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
                    Dataset Search
                  </Typography>
                  <Typography align='center'>
                    Browse available datasets
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button onClick={() => navigate("/datasets/search")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Subset Search
                  </Typography>
                  <Typography align='center'>
                    Search within a dataset
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button onClick={() => navigate("/datasets/subsets/search")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
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
                    Customize and interact with
                    <br />
                    visualization of analysis
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button onClick={() => navigate("/graph")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={4} justifyContent="center" sx={{ mt: "25px" }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Dataset Upload
                  </Typography>
                  <Typography align='center'>
                    Upload a dataset or
                    <br />
                    connect to API
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button onClick={() => navigate("/upload")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align='center'>
                    Graph Search
                  </Typography>
                  <Typography align='center'>
                    Browse visualizations published by our users
                  </Typography>
                </CardContent>
                <CardActions style={{ justifyContent: 'center' }}>
                  <Button onClick={() => navigate("/graphs/search")} variant="contained" sx={{ borderRadius: 50, bgcolor: 'black', color: 'white' }}>SELECT</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </main>

      <footer>
        <Container sx={{ py: 4, maxWidth: '70%' }} maxWidth={false}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
                component="div"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Link to="mailto:sbuongiorno@smu.edu">
                  Contact Us
                </Link>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
                component="div"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Link to="https://github.com/stephbuon/democracy-viewer-demo/tree/main" target="_blank" rel="noopener noreferrer">
                  Visit our GitHub Page
                </Link>
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
                component="div"
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Link to="/acknowledgements">
                  Acknowledgements
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </ThemeProvider>
  );
}
