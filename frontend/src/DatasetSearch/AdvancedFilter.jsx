import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import ReactSelect from 'react-select';

//Other Imports
import './AdvancedFilter.css'
import { GetAllTags } from '../apiFolder/DatasetSearchAPI';

export const AdvancedFilter = (props) => {
    //values
    // const [searchTerm, setSearchTerm] = useState('');
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState('');
    const [allTags, setAllTags] = useState([]);

    const filterResults = () => {
        const filter = {
            title: title ? title : null,
            description: description ? description : null,
            username: username ? username : null,
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

    useEffect(() => {
        GetAllTags().then(res => {
            let _tags = [];
            res.forEach(tag => {
                _tags.push({ value: tag, label: tag });
            });
            setAllTags([..._tags]);
        });
    }, []);

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
                <Typography variant="h2">Advanced Filter</Typography>
            </Box>

            <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                    <Typography>Dataset Title:</Typography>
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
                    <Typography>Dataset Description:</Typography>
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
                    <Typography>Dataset Owner:</Typography>
                    <TextField
                        id="Owner"
                        label="Owner"
                        variant="filled"
                        fullWidth
                        sx={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(0, 0, 0)'
                        }}
                        value={username}
                        onChange={event => { setUsername(event.target.value) }}
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography>Privacy:</Typography>
                    <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                        <Select
                            value={publicPrivate}
                            onChange={event => setPublicPrivate(event.target.value)}
                        >
                            <MenuItem value={true}>Public</MenuItem>
                            <MenuItem value={false}>Private</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography>Tags:</Typography>
                    <ReactSelect
                        options={allTags}
                        id="valueSelect"
                        closeMenuOnSelect={false}
                        onChange={(x) => setSelectedTags(x)}
                        isMulti
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
