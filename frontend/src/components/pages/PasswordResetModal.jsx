import { useState } from "react";
import { FormattedTextField } from "../common/forms";

import { createResetPasswordCode, verifyResetPasswordCode, resetPassword } from "../../api";

// MUI Imports
import { 
    Box, Button, Grid, LinearProgress, Snackbar, Alert, Typography
} from '@mui/material';

export const PasswordResetModal = (props) => {
    const [loadedPage, setLoadedPage] = useState(1);
    const [disabled, setDisabled] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [alert, setAlert] = useState(0);
    const [loading, setLoading] = useState(false);

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

    const nextStep = () => {
        setLoading(true);
        if (loadedPage === 1) {
            createResetPasswordCode(email)
                .then(x => setLoadedPage(2))
                .catch(x => setAlert(1))
                .finally(x => setLoading(false));
        } else if (loadedPage === 2) {
            verifyResetPasswordCode(email, code)
                .then(x => setLoadedPage(3))
                .catch(x => setAlert(2))
                .finally(x => setLoading(false));
        } else if (loadedPage === 3) {
            resetPassword(email, password, code)
                .then(x => setLoadedPage(4))
                .catch(x => setAlert(3))
                .finally(x => setLoading(false));
        } else {
            setLoading(false);
            throw new Error(`Invalid page: ${ loadedPage }`);
        }
    }

    return <>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={alert > 0}
            autoHideDuration={6000}
            onClose={() => setAlert(0)}
        >
            <Alert onClose={() => setAlert(0)} severity="error" sx={{ width: '100%' }}>
                {alert === 1 && <>No account exists with this email address</>}
                {alert === 2 && <>This code is either invalid or expired</>}
                {alert === 3 && <>Failed to reset password</>}
            </Alert>
        </Snackbar>

        <Box
            sx={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                height: "80%",
                overflowY: "auto",
                width: "80%",
                bgcolor: 'background.paper',
                border: '1px solid #000',
                borderRadius: ".5em .5em",
                boxShadow: 24,
                p: 4,
                outline: 'none'
            }}
        >
            <Box sx={{
                width: '100%',
                mb: 3,
                '& .MuiLinearProgress-root': {
                    height: '10px',
                    borderRadius: '5px'
                }
            }}>
                <LinearProgress variant="determinate" value={(loadedPage / 4) * 100} />
            </Box>
            <Typography variant="h4" sx={{ margin: "10px auto", textAlign: "center"}}>Reset Password</Typography>

            {loadedPage === 1 && <>
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
            </>}

            {loadedPage === 2 && <>
                <FormattedTextField
                    id = "code"
                    label = "Password Reset Code"
                    setValid={setValid}
                    fullWidth
                    required
                    setValue={setCode}
                />
            </>}

            {loadedPage === 3 && <>
                <Grid item xs={12} sx={{ margin: "20px 0" }}>
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
            </>}

            {loadedPage === 4 && <>
                <p>You have successfully reset your password. You may now click close to log in.</p>
            </>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                {loadedPage === 1 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        onClick={() => props.setModalOpen(false)}
                    >
                        Cancel
                    </Button>
                )}
                {loadedPage > 1 && loadedPage < 4 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        onClick={() => setLoadedPage(loadedPage - 1)}
                    >
                        Back
                    </Button>
                )}
                {loadedPage < 4 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        disabled={disabled || loading}
                        onClick={() => nextStep()}
                    >
                        Next
                    </Button>
                )}
                {loadedPage === 4 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}  
                        onClick={() => props.setModalOpen(false)}
                    >
                        Close
                    </Button>
                )}
            </Box>
        </Box>
    </>;
}