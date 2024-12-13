import { Avatar, Button, CssBaseline, TextField, Grid, Box, Typography, Container, createTheme, ThemeProvider, Snackbar, Alert, Modal } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate} from "react-router-dom";
import { LoginRequest } from '../apiFolder/LoginRegister';
import { useState, useEffect  } from "react";
import { Link } from "react-router-dom";
import { PasswordResetModal } from "./PasswordResetModal";

const theme = createTheme();

export default function Login(props) {
  const navigate = useNavigate();
  const [snackBarOpen1, setSnackBarOpen1] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
    LoginRequest({
      email: data.get('email'),
      password: data.get('password')
    }).then(async (res) => {
      props.login({token: res, email: data.get('email')})
    }).then(()=>{navigate('/')}).catch((err => setLoginFailed(true)));
  };

  return <>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <PasswordResetModal setModalOpen={setModalOpen}/>
      </Modal>

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
              label="Email"
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
              sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="#" variant="body2" onClick={() => setModalOpen(true)}>
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
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
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={loginFailed}
        autoHideDuration={6000}
        onClose={() => setLoginFailed(false)}
    >
        <Alert onClose={() => setLoginFailed(false)} severity="error">
            Email or password incorrect
        </Alert>
    </Snackbar>
  </>;
}