export const Groups = (props) => {
    const navigate = useNavigate();

    const [loadingGroups, setLoadingGroups] = useState(true);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        GetGroups({}).then(async (res) => {
            setGroups(res);
        }).finally(() => setTimeout(() => setLoadingGroups(false), 3000))
    }, []);
}

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import * as React from 'react';
import { TableBody, TableHead, TableRow, TableCell } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Switch, Route, Redirect, } from "react-router-dom";
import Login from './Login';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";


import { GetGroups } from '../apiFolder/GroupAPI';
import { withTheme } from '@emotion/react';

const theme = createTheme();

    export default function grouppage() {
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
                  Join a Group
                </Typography>
                <Typography variant="h5" align="center" color="text.secondary" paragraph>
                Focus in. Join a community to analyze texts that you need.
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
                        height: 200,
                        width: '100%'
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
                    <CardActions style={{ justifyContent: 'center' }}>
                      <Button href="/datasets/search" variant="contained" sx={{ borderRadius: 50 }}>SELECT</Button>
                    </CardActions>
                  </Card>
                </Grid>
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
                    <CardActions style={{ justifyContent: 'center' }}>
                      <Button href="/datasets/subsets/search" variant="contained" sx={{ borderRadius: 50 }}>SELECT</Button>
                    </CardActions>
                  </Card>
    
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