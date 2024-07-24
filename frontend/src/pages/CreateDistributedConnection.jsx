import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AddLinkIcon from '@mui/icons-material/AddLink';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { MenuItem, Select } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from "react";
import { addDistributedConnection } from '../api/api';

// let FileSaver = require('file-saver');

const theme = createTheme();

export default function CreateDistributedConnection(props) {
  const navigate = useNavigate();

  const [snackBarOpen, setSnackBarOpen] = useState(false);


  const loggedIn = () => {
    if(props.currUser) {
      return true;
    } else {
      const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
      if (demoV && demoV.user) {
        return true;
      } else {
        return false;
      }
    }
  }
  useEffect(() => {
    if(!loggedIn())
    {
      props.setNavigated(true)
      navigate('/login');
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = {
        region: data.get('region'),
        bucket: data.get('bucket'),
        dir: data.get('dir'),
        key_: data.get('key_'),
        secret: data.get('secret')
    }
    addDistributedConnection(data.get("name"), params).then(async (res) => { //Use connection. Need the use connection endpoint
      navigate('/');
    }).catch(ex => {
      openSnackbar();
    });
  };

  const openSnackbar = () => {
        setSnackBarOpen(true)
  }
  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackBarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <AddLinkIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create Distributed Connection
          </Typography>
          <Typography component = "span">

          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Connection Name"
                  name="name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="region"
                  label="AWS Region"
                  name="region"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="bucket"
                  label="S3 Bucket"
                  name="bucket"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="dir"
                  label="Directory Within Bucket"
                  name="dir"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="key_"
                  label="Access Key"
                  type="password"
                  name="key_"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="secret"
                  label="Key Secret"
                  type="password"
                  id="secret"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="mt-2"
              sx={{
                  backgroundColor: "black", 
                  color: "white"
              }}
            >
              Create Connection
            </Button>
          </Box>
        </Box>
      </Container>
      <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={snackBarOpen}
            autoHideDuration={6000}
            onClose={handleSnackBarClose}
        >
            <Alert onClose={handleSnackBarClose} severity="error">
            Failed to connect to new database connection
            </Alert>
        </Snackbar>
      
    </ThemeProvider>
  );
}