import { useState } from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { FormattedPatternField, FormattedTextField } from '../common/forms';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LoginRequest, RegisterRequest } from '../apiFolder/LoginRegister';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getUser } from "../api/users";
import { Alert, Snackbar, Link, Grid, Box, Typography, Container, FormControl} from "@mui/material";

const theme = createTheme();

export default function Register(props) {
  const [disabled, setDisabled] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [title, setTitle] = useState("");
  const [orcid, setOrcid] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");

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

  const setValid = (val) => {
    if (!disabled) {
      if (!val) {
        setDisabled(true);
      }
    } else if (val) {
      const errors = document.querySelectorAll("p.Mui-error");
      if (errors.length === 0) {
        setDisabled(false);
      }
    }
  }

  const handleSubmit = () => {
    const data = {
      username,
      email,
      password,
      title,
      first_name: firstName,
      last_name: lastName,
      suffix,
      linkedin_link: linkedin,
      website,
      orcid: orcid.replaceAll("-", "")
    };
    Object.keys(data).forEach(x => {
      if (!data[x]) {
        delete data[x];
      }
    });
    
    getUser(data.username).then(user => {
      if (!user) {
        RegisterRequest(data).then(async (res) => {
          LoginRequest(data).then(async (res) => {
          props.login({token: res, username: data.username})
        }).then(()=>{navigate('/')})}).catch(res => setOpenAlert(true));
      } else {
        setOpenAlert(true);
      }
    });
  };

  return <>
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
          <Box component="form" noValidate sx={{ mt: 3 }}>
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
                    setValue={setUsername}
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
                    setValue={setEmail}
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
                    setValue={setConfirmPassword}
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
                    setValue={setFirstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "last_name"
                    label = "Last Name"
                    maxChars = {20}
                    setValid={setValid}
                    autoComplete="family-name"
                    setValue={setLastName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "suffix"
                    label = "Suffix"
                    maxChars = {10}
                    setValid={setValid}
                    setValue={setSuffix}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormattedTextField
                    id = "title"
                    label = "Title"
                    maxChars = {20}
                    setValid={setValid}
                    setValue={setTitle}
                />
              </Grid>
              <Grid item xs={12}>
                <FormattedPatternField
                  id = "orcid"
                  label = "OrcID"
                  setValid={setValid}
                  format="####-####-####-####"
                  mask="_"
                  numeric
                  fullWidth
                  setValue={setOrcid}
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
                    setValue={setLinkedin}
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
                    setValue={setWebsite}
                />
              </Grid>
            </Grid>
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
              disabled = {disabled}
              onClick={() => handleSubmit()}
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

    <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openAlert}
        autoHideDuration={6000}
        onClose={() => setOpenAlert(false)}
    >
        <Alert onClose={() => setOpenAlert(false)} severity="error">
            Failed to create account. An account with this username may already exist.
        </Alert>
    </Snackbar>
  </>;
}