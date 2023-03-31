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
import { BrowserRouter as Router, Switch, 
  Route, Redirect,} from "react-router-dom";
import Login from './Login';


//Need to add if logged in to all buttons 


const theme = createTheme();

export default function Homepage() {
  return (

    
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Text-Mining Development 
          </Typography>
        </Toolbar>
      </AppBar>
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
              Text-Mining Development 
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              A community to share and access numerous historical datasets. Helping to further research and knowledge on a daily basis.
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
       
          <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      // 16:9
                      height :200,
                      width:'100%'
                    }}
                    image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Search
                    </Typography>
                    <Typography align='center'>
                    Browse datasets or conduct an Advanced search
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                    <Button href="/datasetsearch" variant="contained" sx={{borderRadius: 50 }}>SELECT</Button>
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
                      height :200,
                      width:'100%'
                    }}
                    image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Subset
                    </Typography>
                    <Typography align='center'>
                    Find records in a dataset
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                    <Button href="/subsetsearch" variant="contained" sx={{borderRadius: 50 }}>SELECT</Button>
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
                      height :200,
                      width:'100%'
                    }}
                    image="https://cdn.pixabay.com/photo/2018/11/29/21/51/social-media-3846597_1280.png"
                 
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Groups
                    </Typography>
                    <Typography align='center'>
                      Join or Create a Group 
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                  
                    <Button href="/login" variant="contained" sx={{borderRadius: 50 }} 
                       >SELECT</Button>
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
                      height :200,
                      width:'100%'
                    }}
                    image="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Profile
                    </Typography>
                    <Typography align='center'>
                      Access Your Profile
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                    <Button href="/profile" variant="contained" sx={{borderRadius: 50 }}>SELECT</Button>
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
                      height :200,
                      width:'100%'
                    }}
                    image="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_1280.png"
                    alt="random"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Upload
                    </Typography>
                    <Typography align='center'>
                      Upload a Personal Dataset
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                    <Button href="/src/pages/Login.jsx" variant="contained" sx={{borderRadius: 50 }}>SELECT</Button>
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
                      height :200,
                      width:'100%'
                    }}
                    image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Graph
                    </Typography>
                    <Typography align='center'>
                    View customizable and interactive graphs
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                    <Button href="/graph" variant="contained" sx={{borderRadius: 50 }}>SELECT</Button>
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
                      height :200,
                      width:'100%'
                    }}
                    image="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2" align='center'>
                      Sign In
                    </Typography>
                    <Typography align='center'>
                    Sign in to your account or create a new account
                    </Typography>
                  </CardContent>
                  <CardActions style={{justifyContent: 'center'}}>
                    <Button href="/login-register" variant="contained" sx={{borderRadius: 50 }}>SELECT</Button>
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