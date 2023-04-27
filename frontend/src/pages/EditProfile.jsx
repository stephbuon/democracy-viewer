import { FormControl, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { updateUser } from "../api/users";

export const EditProfile = ({ user, setUser, open, setOpen }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = {};

        Object.keys(user).forEach(key => {
            if (key !== "username") {
                console.log(user)
                const val = data.get(key);
                console.log(key, val)
                if (!val && user[key]) {
                    params[key] = null;
                } else if (val && val !== user[key]) {
                    params[key] = val;
                } 
            }
        });

        updateUser(user.username, params).then(x => {
            setUser(x);
            setOpen(false);
        });
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
                    <TextField
                            margin="normal"
                            id="username"
                            label="Username"
                            name="username"
                            defaultValue = { user.username ? user.username : "" }
                            // InputProps={{
                            //     readOnly: true,
                            // }}
                            disabled
                        />

                        <TextField
                            margin="normal"
                            id="email"
                            label="Email Address"
                            name="email"
                            defaultValue = { user.email ? user.email : "" }
                        />

                        <TextField
                            margin="normal"
                            id="first_name"
                            label="First Name"
                            name="first_name"
                            defaultValue = { user.first_name ? user.first_name : "" }
                        />

                        <TextField
                            margin="normal"
                            name="last_name"
                            label="Last Name"
                            id="last_name"
                            defaultValue = { user.last_name ? user.last_name : "" }
                        />

                        <TextField
                            margin="normal"
                            id="suffix"
                            label="Suffix"
                            name="suffix"
                            defaultValue = { user.suffix ? user.suffix : "" }
                        />

                        <TextField
                            margin="normal"
                            name="title"
                            label="Title"
                            id="title"
                            defaultValue = { user.title ? user.title : "" }
                        />

                        <TextField
                            margin="normal"
                            id="orcid"
                            label="OrcID"
                            name="orcid"
                            defaultValue = { user.orcid ? user.orcid : "" }
                        />

                        <TextField
                            margin="normal"
                            id="linkedin"
                            label="LinkenIn Link"
                            name="linkedin"
                            defaultValue = { user.linkedin_link ? user.linkedin_link : "" }
                        />

                        <TextField
                            margin="normal"
                            id="website"
                            label="Website"
                            name="website"
                            defaultValue = { user.website ? user.website : "" }
                        />
                    
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Update Profile
                        </Button>
                    </FormControl>
                    
                </Box>
            </Box>
        </Modal>
    )
}