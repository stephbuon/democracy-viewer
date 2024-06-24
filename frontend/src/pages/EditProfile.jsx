import { FormControl, Modal } from "@mui/material";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { updateUser } from "../api/users";
import { FormattedTextField, FormattedPatternField } from "../common/forms";
import { useState } from "react";

export const EditProfile = ({ user, setUser, open, setOpen }) => {
    const [disabled, setDisabled] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const output = {};
        data.keys().forEach(key => {
            let value = data.get(key);
            if (key === "orcid") {
                value = value.replaceAll("-", "");
            }

            if (value !== user[key]) {
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
        <Modal open = { open } onClose={() => setOpen(false)}>
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
                    borderRadius: ".5em .5em"
                }}
            >
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}  className = "text-center">
                    <FormControl>
                        <FormattedTextField
                            id = "username"
                            label = "Username"
                            defaultText = {user.username}
                            disabled
                        />

                        <FormattedTextField
                            id = "email"
                            label = "Email Address"
                            defaultText = {user.email}
                            email
                            maxChars = {30}
                            setDisabled={setDisabled}
                            autoComplete="email"
                        />

                        <FormattedTextField
                            id = "first_name"
                            label = "First Name"
                            defaultText = {user.first_name}
                            maxChars = {20}
                            setDisabled={setDisabled}
                            autoComplete="given-name"
                        />

                        <FormattedTextField
                            id = "last_name"
                            label = "Last Name"
                            defaultText = {user.last_name}
                            maxChars = {20}
                            setDisabled={setDisabled}
                            autoComplete="family-name"
                        />

                        <FormattedTextField
                            id = "suffix"
                            label = "Suffix"
                            defaultText = {user.suffix}
                            maxChars = {10}
                            setDisabled={setDisabled}
                        />

                        <FormattedTextField
                            id = "title"
                            label = "Title"
                            defaultText = {user.title}
                            maxChars = {20}
                            setDisabled={setDisabled}
                        />

                        <FormattedPatternField
                            id = "orcid"
                            label = "OrcID"
                            defaultText = {user.orcid}
                            setDisabled={setDisabled}
                            pattern = "####-####-####-####"
                            numeric
                        />

                        <FormattedTextField
                            id = "linkedin_link"
                            label = "LinkedIn Link"
                            defaultText = {user.linkedin_link}
                            maxChars = {50}
                            setDisabled={setDisabled}
                            website
                            autoComplete="LinkedIn"
                        />

                        <FormattedTextField
                            id = "website"
                            label = "Website Link"
                            defaultText = {user.website}
                            maxChars = {50}
                            setDisabled={setDisabled}
                            website
                        />
                    
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled = {disabled}
                        >
                            Update Profile
                        </Button>
                    </FormControl>
                    
                </Box>
            </Box>
        </Modal>
    )
}