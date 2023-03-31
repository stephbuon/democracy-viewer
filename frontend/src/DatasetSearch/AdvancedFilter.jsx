import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

//MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';

import { MultiCheckBoxSelect } from './MultiCheckBoxSelect';



//Other Imports
import './AdvancedFilter.css'

export const AdvancedFilter = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    //values
    // const [searchTerm, setSearchTerm] = useState('');
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [description, setDescription] = useState('');

    const filterResults = () => {
        let tags = ''
        for (let tag in selectedTags) {
            tags += `&tag=${tag.tag}`;
        }
        console.log("tags", tags)
        let filter = {
            title: title ? `&title=${title}` : '',
            description: description ? `&description=${description}` : '',
            username: username ? `&username=${username}` : '',
            type: publicPrivate ? 'public' : 'private',
            tags: tags,
            advanced: true
        }
        console.log("filter before", filter)
        // props.setAdvancedFilter(filter);
        props.advancedFilterResults(filter);
    }

    const loggedIn = () => {
        //check if user is logged in
        //for now will return false since system is not hooked up
        return false;
    }

    const changeTagsValue = delta => setSelectedTags([ ...selectedTags, ...delta ]);


    useEffect(() => {
        console.log("Rendering Advanced Filter")
    }, []);



    return (
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
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                                
                            }}>
                            <h2>Advanced Filter</h2>
                        </TableCell>
                    </TableRow>
                </TableHead>
            </Table>
            <Table 
            sx={{
                
            }}>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            Dataset Title:
                        </TableCell>
                        <TableCell>
                            <TextField
                                id="Title"
                                label="Title"
                                variant="filled"
                                sx={{
                                    background: 'rgb(255, 255, 255)',
                                    color: 'rgb(0, 0, 0)'
                                }}
                                value={title}
                                onChange={event => { setTitle(event.target.value) }}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Dataset Description:
                        </TableCell>
                        <TableCell>
                            <TextField
                                id="Description"
                                label="Description"
                                variant="filled"
                                sx={{
                                    background: 'rgb(255, 255, 255)',
                                    color: 'rgb(0, 0, 0)'
                                }}
                                value={description}
                                onChange={event => { setDescription(event.target.value) }}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Dataset Owner:
                        </TableCell>
                        <TableCell>
                            <TextField
                                id="Owner"
                                label="Owner"
                                variant="filled"
                                sx={{
                                    background: 'rgb(255, 255, 255)',
                                    color: 'rgb(0, 0, 0)'
                                }}
                                value={username}
                                onChange={event => { setUsername(event.target.value) }}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Privacy:
                        </TableCell>
                        <TableCell>
                            <FormControl>
                                <Select
                                    value={publicPrivate}
                                    onChange={event => setPublicPrivate(event.target.value)}
                                    sx={{
                                        background: 'rgb(255, 255, 255)',
                                        color: 'rgb(0, 0, 0)'
                                    }}
                                >
                                    <MenuItem value={true}>Public</MenuItem>
                                    <MenuItem value={false} >Private</MenuItem>{/*onClick={() => openSnackbar()} MAY NEED THIS IN FUTURE*/}
                                </Select>
                            </FormControl>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            Tags:
                        </TableCell>
                        {/* NOT CURRENTLY FUNCTIONAL COMMENTING OUT FOR NOW
                        
                        <TableCell>
                            <FormControl sx={{ m: 1, width: 300 }}>
                                {/* <InputLabel id="tag-checkbox-label">Tag</InputLabel>
                                <Select
                                    labelId="tag-checkbox-label"
                                    id="tag-checkbox"
                                    multiple
                                    value={totalTags}
                                    onChange={() => changeTagsValue()}
                                    input={<OutlinedInput label="Tag" />}
                                    // renderValue={(selected) => selected.join(', ')}
                                    // MenuProps={MenuProps}
                                >
                                    {allTagOptions.map((tag) => (
                                        <MenuItem key={tag.tag} value={tag.tag}>
                                            <Checkbox checked={allTagOptions.indexOf(tag).checked} />
                                            <ListItemText primary={tag.tag} />
                                        </MenuItem>
                                    ))}
                                </Select> 
                                <MultiCheckBoxSelect setSelectedTags={delta => setSelectedTags([ ...selectedTags, ...delta ])}/>
                            </FormControl>
                                    </TableCell>*/}
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            &nbsp;
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="contained"
                                primary
                                onClick={() => filterResults()}
                            >
                                Apply Filters
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Box>
    )

}