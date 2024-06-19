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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { BrowserRouter as Router, Switch, 
    Route, Redirect, useNavigate} from "react-router-dom";
import { LoginRequest } from '../apiFolder/LoginRegister';
import { useState, useEffect  } from "react";


const theme = createTheme();

export default function Login(props) {
  const navigate = useNavigate();
  const [snackBarOpen1, setSnackBarOpen1] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const openSnackbar1 = () => {
    setSnackBarOpen1(true)
  }
  const handleSnackBarClose1 = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackBarOpen1(false);
  };
  const loggedIn = () => {
    if(props.currUser)
    {
      return true;
    }
    return false;
  }
  useEffect(() => {
    if(loggedIn())
    {
      navigate('/')
    }
    if(props.navigated)
    {
        props.setNavigated(false)
        openSnackbar1()
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    LoginRequest({username: data.get('email'),
    password: data.get('password'),}).then(async (res) => {
      props.login({token: res, username: data.get('email')})
    }).then(()=>{navigate('/')}).catch((err => setLoginFailed(true)));
  };

  return (<div>
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
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Username"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
           
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              // onClick={()=>Login()}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
          {
            loginFailed &&
            <p className = "text-center text-danger">Invalid credentials</p>
          }
        </Box>
      </Container>
    </ThemeProvider>
    <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackBarOpen1}
        autoHideDuration={6000}
        onClose={() => handleSnackBarClose1()}
      >
        <Alert onClose={handleSnackBarClose1} severity="error" sx={{ width: '100%' }}>
          You must login first
        </Alert>
      </Snackbar>
    </div>
  );
}