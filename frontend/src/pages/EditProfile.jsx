import { FormControl, Modal } from "@mui/material";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { updateUser } from "../api/users";
import { PatternFormat } from "react-number-format";

export const EditProfile = ({ user, setUser, open, setOpen }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        updateUser
            (user.username,
            {
                username:user.username,
                email:data.get('email'),
                first_name:data.get('first_name'),
                last_name:data.get('last_name'),
                suffix:data.get('suffix'),
                title:data.get('title'),
                orcid:data.get('orcid'),
                linkedin_link:data.get('linkedin_link'),
                website:data.get('website'),
            }
            ).then(x => {
                setUser(x);
                setOpen(false);
            })
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

                        <PatternFormat
                            customInput={TextField}
                            margin="normal"
                            id="orcid"
                            label="OrcID"
                            name="orcid"
                            value={ user.orcid ? user.orcid : "" }
                            format="####-####-####-####" 
                            mask="_"
                        />

                        <TextField
                            margin="normal"
                            id="linkedin_link"
                            label="LinkenIn Link"
                            name="linkedin_link"
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