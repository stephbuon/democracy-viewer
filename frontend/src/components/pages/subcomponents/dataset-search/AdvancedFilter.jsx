import { useState } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

//Other Imports
import '../../../../styles/AdvancedFilter.css'
import { GetAllTags } from "../../../../api";
import { FormattedMultiSelectField } from "../../../common";
import { InputLabel } from "@mui/material";

export const AdvancedFilter = (props) => {
    //values
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState('');

    const filterResults = () => {
        const filter = {
            title: title ? title : null,
            description: description ? description : null,
            email: email ? email : null,
            type: publicPrivate ? 'public' : 'private',
            tag: selectedTags.length > 0 ? selectedTags.map(x => x.value) : null,
            advanced: true
        };
        Object.keys(filter).forEach(x => {
            if (!filter[x]) {
                delete filter[x];
            }
        });
        props.advancedFilterResults(filter);
    };

    return (
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
            <Box
                sx={{
                    textAlign: 'center',
                    mb: 4,
                    p: 2,
                }}
            >
                <Typography variant="h3">Advanced Filter</Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        id="Title"
                        label="Title"
                        variant="filled"
                        fullWidth
                        sx={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(0, 0, 0)'
                        }}
                        value={title}
                        onChange={event => { setTitle(event.target.value) }}
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        id="Description"
                        label="Description"
                        variant="filled"
                        fullWidth
                        sx={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(0, 0, 0)'
                        }}
                        value={description}
                        onChange={event => { setDescription(event.target.value) }}
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        id="Owner"
                        label="Owner"
                        variant="filled"
                        fullWidth
                        sx={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(0, 0, 0)'
                        }}
                        value={email}
                        onChange={event => { setEmail(event.target.value) }}
                    />
                </Box>

                {<Box sx={{ mb: 2 }}>
                    <FormControl
                        fullWidth
                        variant="filled" 
                        sx={{ background: 'rgb(255, 255, 255)' }}
                    >
                        <InputLabel>Privacy</InputLabel>
                        <Select
                            label="Privacy"
                            value={publicPrivate}
                            onChange={event => setPublicPrivate(event.target.value)}
                        >
                            <MenuItem value={true}>Public</MenuItem>
                            <MenuItem value={false}>Private</MenuItem>
                        </Select>
                    </FormControl>
                </Box>}

                <Box sx={{ mb: 2 }}>
                    <FormattedMultiSelectField
                        label = "Tags"
                        selectedOptions={selectedTags}
                        setSelectedOptions={setSelectedTags}
                        getData={GetAllTags}
                        id="valueSelect"
                    />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        primary
                        onClick={() => filterResults()}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
