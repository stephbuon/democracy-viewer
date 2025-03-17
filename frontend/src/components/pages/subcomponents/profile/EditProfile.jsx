import { Modal, Button, Box, Grid } from "@mui/material";
import { updateUser } from "../../../../api";
import { FormattedTextField, FormattedPatternField } from "../../../common/forms";
import { useState } from "react";

export const EditProfile = ({ user, setUser, open, setOpen }) => {
    const [disabled, setDisabled] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [suffix, setSuffix] = useState("");
    const [title, setTitle] = useState("");
    const [orcid, setOrcid] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [website, setWebsite] = useState("");

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
            first_name: firstName,
            last_name: lastName,
            suffix,
            title,
            orcid,
            linkedin_link: linkedin,
            website
        };
        const output = {};
        Object.keys(data).forEach(key => {
            let value = data[key];
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
            updateUser(user.email, output).then(x => {
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
                    left: '25%',
                    height: "70%",
                    overflow: "scroll",
                    width: "50%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em",
                }}
            >
                <Box component="form" noValidate sx={{ mt: 6 }} className="text-center">
                    <Grid container columnSpacing={2} rowSpacing={3}>

                        <Grid item xs={6}>
                            <FormattedTextField
                                id="first_name"
                                label="First Name"
                                defaultValue={user.first_name}
                                maxChars={20}
                                setValid={setValid}
                                autoComplete="given-name"
                                setValue={setFirstName}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedTextField
                                id="last_name"
                                label="Last Name"
                                defaultValue={user.last_name}
                                maxChars={20}
                                setValid={setValid}
                                autoComplete="family-name"
                                setValue={setLastName}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedTextField
                                id="suffix"
                                label="Suffix"
                                defaultValue={user.suffix}
                                maxChars={10}
                                setValid={setValid}
                                setValue={setSuffix}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedTextField
                                id="title"
                                label="Title"
                                defaultValue={user.title}
                                maxChars={20}
                                setValid={setValid}
                                setValue={setTitle}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedTextField
                                id="email"
                                label="Email Address"
                                defaultValue={user.email}
                                email
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedPatternField
                                id="orcid"
                                label="OrcID"
                                defaultValue={user.orcid}
                                setValid={setValid}
                                format="####-####-####-####"
                                mask="_"
                                numeric
                                setValue={setOrcid}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedTextField
                                id="linkedin_link"
                                label="LinkedIn Link"
                                defaultValue={user.linkedin_link}
                                maxChars={200}
                                setValid={setValid}
                                website
                                autoComplete="LinkedIn"
                                setValue={setLinkedin}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormattedTextField
                                id="website"
                                label="Website Link"
                                defaultValue={user.website}
                                maxChars={200}
                                setValid={setValid}
                                website
                                setValue={setWebsite}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                        disabled={disabled}
                        onClick={() => handleSubmit()}
                    >
                        Update Profile
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}