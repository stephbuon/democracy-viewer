import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AddLinkIcon from '@mui/icons-material/AddLink';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CreateConnection, DownloadSchema } from '../apiFolder/DistributedBackendAPI';
import { useNavigate } from 'react-router-dom';
import { MenuItem, Select } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useState, useEffect } from "react";

let FileSaver = require('file-saver');

const theme = createTheme();

export default function CreateDistributedConnection(props) {
  const navigate = useNavigate();

  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const loggedIn = () => {
    if(props.currUser)
    {
      return true;
    }
    return false;
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
    let packet = {
        name: data.get('connectionName'),
        host: data.get('ip_address'),
        port: data.get('portNum'),
        database: data.get('databaseName'),
        username: data.get('dbusername'),
        password: data.get('dbpassword'),
        client: data.get('client'),
        is_public: data.get('is_public')
    }
    CreateConnection(packet).then(async (res) => { //Use connection. Need the use connection endpoint
        navigate('/')
    }).catch(ex => {
      console.log("something went wrong making distributed connection")
      openSnackbar()
    })
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
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="connectionName"
                  label="Connection Name"
                  name="connectionName"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="ip_address"
                  label="Host IP Address"
                  name="ip_address"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="portNum"
                  label="Port Number"
                  name="portNum"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="databaseName"
                  label="Database Name"
                  name="databaseName"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="dbusername"
                  label="Database Username"
                  name="dbusername"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="dbpassword"
                  label="Database Password"
                  type="password"
                  id="dbpassword"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                  
                <Select
                  required
                  fullWidth
                  name="client"
                  id="client"
                  label="Client Type"
                  value={false}
                >
                    <MenuItem
                        value={true}
                    >Public</MenuItem>
                    <MenuItem
                        value={false}
                    >Private</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                    required
                    fullWidth
                    name="client"
                    id="client"
                    label="Client Type"
                    value='mysql'
                >
                    <MenuItem
                        value='mysql'
                    >MySQL</MenuItem>
                    <MenuItem
                        value='mssql'
                    >SQL</MenuItem>
                    <MenuItem
                        value='pg'
                    >PostgreSQL</MenuItem>
                </Select>
                </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create Connection
            </Button>
          </Box>
        </Box>
        You need to use our schema for our system to recognize your data. Please click below to download the setup file.
        <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {DownloadSchema().then(file => {
                let blob = new Blob([file], { type: "text/plain;charset=utf-8" });
                FileSaver.saveAs(blob, `democracy_viewer.mysql`);
              })}}
            >
              Download Schema
            </Button>
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