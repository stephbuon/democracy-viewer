import { Modal, Button, Box, Grid } from "@mui/material";
import { updateUser } from "../api/users";
import { FormattedTextField, FormattedPatternField } from "../common/forms";
import { useState } from "react";

export const EditProfile = ({ user, setUser, open, setOpen }) => {
    const [disabled, setDisabled] = useState(false);

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

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const output = {};
        data.keys().forEach(key => {
            let value = data.get(key);
            if (key === "orcid") {
                value = value.replaceAll("-", "");
            }
            
            if (!value && user[key]) {
                output[key] = null;
            } else if (value && value !== user[key]) {
                output[key] = value;
            }
        });

        if (Object.keys(output).length > 0) {
            updateUser(user.username, output).then(x => {
                setUser(x);
            });
        }
        setOpen(false);
    }

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '15%',
                    height: "70%",
                    overflow: "scroll",
                    width: "70%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em",
                }}
            >
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} className="text-center">
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="username"
                                label="Username"
                                defaultText={user.username}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="email"
                                label="Email Address"
                                defaultText={user.email}
                                email
                                maxChars={30}
                                setValid={setValid}
                                autoComplete="email"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="first_name"
                                label="First Name"
                                defaultText={user.first_name}
                                maxChars={20}
                                setValid={setValid}
                                autoComplete="given-name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="last_name"
                                label="Last Name"
                                defaultText={user.last_name}
                                maxChars={20}
                                setValid={setValid}
                                autoComplete="family-name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="suffix"
                                label="Suffix"
                                defaultText={user.suffix}
                                maxChars={10}
                                setValid={setValid}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="title"
                                label="Title"
                                defaultText={user.title}
                                maxChars={20}
                                setValid={setValid}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedPatternField
                                id="orcid"
                                label="OrcID"
                                defaultText={user.orcid}
                                setValid={setValid}
                                pattern="####-####-####-####"
                                numeric
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="linkedin_link"
                                label="LinkedIn Link"
                                defaultText={user.linkedin_link}
                                maxChars={50}
                                setValid={setValid}
                                website
                                autoComplete="LinkedIn"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormattedTextField
                                id="website"
                                label="Website Link"
                                defaultText={user.website}
                                maxChars={50}
                                setValid={setValid}
                                website
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                        disabled={disabled}
                    >
                        Update Profile
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}