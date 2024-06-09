import { useNavigate, useParams } from 'react-router-dom';
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
    const navigate = useNavigate();
    const params = useParams();

    //values
    // const [searchTerm, setSearchTerm] = useState('');
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState('');
    const [allTags, setAllTags] = useState([]);

    const filterResults = () => {
        let tagstr = '';
        selectedTags.forEach(tag => {
            tagstr += `&tag=${tag.value}`;
            console.log("adding to filter", tag.value);
        });
        // console.log("sent tags", selectedTags)
        let filter = {
            title: title ? `&title=${title}` : '',
            description: description ? `&description=${description}` : '',
            username: username ? `&username=${username}` : '',
            type: publicPrivate ? 'public' : 'private',
            tags: tagstr,
            advanced: true
        };
        console.log("filter before", filter);
        // props.setAdvancedFilter(filter);
        props.advancedFilterResults(filter);
    };

    const loggedIn = () => {
        //check if user is logged in
        //for now will return false since system is not hooked up
        return false;
    };

    const changeTagsValue = delta => setSelectedTags([...selectedTags, ...delta]);

    useEffect(() => {
        console.log("Rendering Advanced Filter");
        GetAllTags().then(res => {
            console.log("returned results", res);
            let _tags = [];
            res.forEach(tag => {
                _tags.push({ value: tag, label: tag });
            });
            setAllTags([..._tags]);
        });
    }, []);

    useEffect(() => {
        console.log("all tags var", allTags);
    }, [allTags]);

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
