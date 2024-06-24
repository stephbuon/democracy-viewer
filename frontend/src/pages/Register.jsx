import { useState } from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { FormattedPatternField, FormattedTextField } from '../common/forms';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LoginRequest, RegisterRequest } from '../apiFolder/LoginRegister';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const theme = createTheme();

export default function Register(props) {
  const [complete, setComplete] = useState({
    "username": false,
    "email": false,
    "password": false,
    "confirm_password": false,
    "first_name": false,
    "last_name": false,
    "suffix": false,
    "title": false,
    "orcid": false,
    "linkedin_link": false,
    "website": false,
    
  });
  const [password, setPassword] = useState("");
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const loggedIn = () => {
    if(props.currUser)
    {
      return true;
    }
    return false;
  }
  useEffect(()=>{
    if(loggedIn())
    {
      navigate('/')
    }
  },[]);

  const setValid = (id, val) => {
    // const complete_ = {...complete};
    // complete_[id] = val;
    // setComplete(complete_);

  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let packet = {
      username: data.get('username'),
      password: data.get('password'),
      email: data.get('email'),
      title: data.get('Title'),
      first_name: data.get('firstName'),
      last_name: data.get('lastName'),
      orcid: data.get('OrcID'),
      linkedin_link: data.get('LinkedIn')
    }
    RegisterRequest(packet).then(async (res) => {
      LoginRequest(packet).then(async (res) => {
      props.login({token: res, username: data.get('username')})
    }).then(()=>{navigate('/')})})
  };

  useEffect(() => {
    // let disabled_ = false;
    // debugger;
    // Object.values(complete).forEach(x => {
    //   if (!x) {
    //     disabled_ = true;
    //   }
    // });
    // setDisabled(disabled_);
  }, []);

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
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormattedTextField
                    id = "username"
                    label = "Username"
                    maxChars = {20}
                    setValid={setValid}
                    autoComplete="username"
                    required
                    fullWidth
                    autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedTextField
                    id = "email"
                    label = "Email Address"
                    email
                    maxChars = {30}
                    setValid={setValid}
                    autoComplete="email"
                    fullWidth
                    required
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedTextField
                    id = "password"
                    label = "Password"
                    password
                    maxChars = {30}
                    setValid={setValid}
                    autoComplete="new-password"
                    setValue = {setPassword}
                    fullWidth
                    required
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedTextField
                    id = "confirm_password"
                    label = "Confirm Password"
                    confirmPassword = {password}
                    maxChars = {30}
                    setValid={setValid}
                    autoComplete="new-password"
                    fullWidth
                    required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "first_name"
                    label = "First Name"
                    maxChars = {20}
                    setValid={setValid}
                    autoComplete="given-name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "last_name"
                    label = "Last Name"
                    maxChars = {20}
                    setValid={setValid}
                    autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "suffix"
                    label = "Suffix"
                    maxChars = {10}
                    setValid={setValid}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "title"
                    label = "Title"
                    maxChars = {20}
                    setValid={setValid}
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedPatternField
                  id = "orcid"
                  label = "OrcID"
                  setValid={setValid}
                  pattern = "####-####-####-####"
                  numeric
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedTextField
                    id = "linkedin_link"
                    label = "LinkedIn Link"
                    maxChars = {50}
                    setValid={setValid}
                    website
                    autoComplete="LinkedIn"
                    fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedTextField
                    id = "website"
                    label = "Website Link"
                    maxChars = {50}
                    setValid={setValid}
                    website
                    fullWidth
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled = {disabled}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}