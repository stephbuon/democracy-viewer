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
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';





import { CreateDataset, UploadDataset, AddTextColumn, AddTags, UpdateMetadata } from '../apiFolder/DatasetUploadAPI';



export const UploadModal = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    //values
    // const [searchTerm, setSearchTerm] = useState('');
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(false);
    const [description, setDescription] = useState('');
    const [columnTypes, setColumnTypes] = useState({});
    const [headers, setHeaders] = useState([]);
    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState('');
    const [send, setSend] = useState(false);
    const [loadedPage, setLoadedPage] = useState(1);
    const [useAPI, setUseAPI] = useState(false)
    const [apidatasetname, setApidatasetname] = useState(undefined)
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');



    // const fs = require('fs');
    // const readline = require('readline');

    const FilledOut = () => {
        if (loadedPage == 1) {
            if (!title || !description) { return false }
        }
        else if (loadedPage == 2) {
            if (tags.length < 3) { return false }
        }
        return true

    }

    const addTag = () => {
        if (tag.trim() === "") return; // Prevent adding if tag is blank or just whitespace

        let _tags = [...tags]; // Create a copy of tags for immutability
        _tags.push(tag);
        setTags(_tags);
        console.log("New tags", _tags);
        setTag(''); // Reset input field
    }


    const deleteTag = (_tag) => {

        let _tags = tags
        let index = _tags.indexOf(_tag);
        console.log("deleting tag", index)
        if (index > -1) {
            _tags.splice(index, 1);
            console.log(_tags);
        }
        setTags([..._tags]);
    }
    const SendDataset = () => {
        //fill out
        let _texts = [];
        for (let i = 0; i < headers.length; i++) {
            if (columnTypes[headers[i]] === "TEXT") {
                _texts.push(headers[i])
            }
        }
        if (!useAPI) {
            CreateDataset(props.file).then(async (datasetname) => {
                let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
                demoV.uploadData = datasetname;
                localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
                if (_texts.length > 0) {
                    AddTextColumn(datasetname, _texts);
                }
                if (tags.length > 0) {
                    AddTags(datasetname, tags);
                }
                UploadDataset(datasetname)
                UpdateMetadata(datasetname, title, description, publicPrivate)
                setTimeout(() => {
                    window.open("http://localhost:3000/uploadProgress", "_blank", "noopener,noreferrer");
                }, 1000);
            })
            // }).then(() => { window.open("http://localhost:3000/uploadProgress", "_blank", "noopener,noreferrer"); })
        }
        else {

            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            demoV.uploadData = apidatasetname;
            localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
            UploadDataset(apidatasetname)
            UpdateMetadata(apidatasetname, title, description, publicPrivate)
            if (_texts.length > 0) {
                AddTextColumn(apidatasetname, _texts);
            }
            if (tags.length > 0) {
                AddTags(apidatasetname, tags);
            }

            window.open("http://localhost:3000/uploadProgress", "_blank", "noopener,noreferrer");
        }

        props.CancelUpload();
        return;
    }


    useEffect(() => {
        console.log("Props", props)
        if (props.useAPI) {
            setUseAPI(true)
            setApidatasetname(props.apidatasetname)
            setTitle(props.apidatasetname)
        }
        else {
            setTitle(props.file.name.substr(0, props.file.name.length - 4))
        }
        setHeaders(props.headers)
    }, [props]);

    useEffect(() => {
        console.log("ColumnTypes", columnTypes)
    }, [columnTypes]);


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
            <Box sx={{
                width: '100%',
                marginTop: '30px',
                marginBottom: '0px', // Reduce the bottom margin
                '& .MuiLinearProgress-root': {
                    height: '15px',
                    borderRadius: '5px'
                }
            }}>
                <LinearProgress variant="determinate" value={(loadedPage / 3) * 100} />
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell className='col-10'>
                        </TableCell>

                    </TableRow>
                </TableHead>
            </Table>
            {loadedPage === 1 && <><Table>
                <TableBody>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            <h3>Dataset Information
                                <Tooltip title="Provide general information about the dataset.">
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </h3>
                        </TableCell>
                    </TableRow>


                </TableBody>
            </Table>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className='col-6'>
                                Title:
                            </TableCell>
                            <TableCell className='col-6'>
                                <TextField
                                    id="Title"
                                    label="Title"
                                    variant="filled"
                                    // disabled
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
                            <TableCell className='col-6'>
                                Author:
                            </TableCell>
                            <TableCell className='col-6'>
                                <TextField
                                    id="Author"
                                    label="Author"
                                    variant="filled"
                                    sx={{
                                        background: 'rgb(255, 255, 255)',
                                        color: 'rgb(0, 0, 0)'
                                    }}
                                    value={author} // Ensure you have a corresponding state for this
                                    onChange={event => { setAuthor(event.target.value) }} // Ensure you have a corresponding handler function
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className='col-6'>
                                Date Collected:
                            </TableCell>
                            <TableCell className='col-6'>
                                <TextField
                                    id="Date"
                                    label="Date"
                                    type="date"
                                    variant="filled"
                                    InputLabelProps={{
                                        shrink: true, // This is necessary for the date label to behave correctly
                                    }}
                                    sx={{
                                        background: 'rgb(255, 255, 255)',
                                        color: 'rgb(0, 0, 0)'
                                    }}
                                    value={date} // Ensure you have a corresponding state for this
                                    onChange={event => { setDate(event.target.value) }} // Ensure you have a corresponding handler function
                                />
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell className='col-6'>
                                Description:
                                <Tooltip title="A Summary of the Dataset.">
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            <TableCell className='col-6'>
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
                            <TableCell className='col-6'>
                                Privacy:
                                <Tooltip title="Private: Data can only be seen by owner and selected members. Public: Data can be seen by everyone and discovered in a search.">
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                            <TableCell className='col-6'>

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
                                        <MenuItem value={false}>Private</MenuItem>
                                    </Select>
                                </FormControl>

                            </TableCell>

                        </TableRow>

                    </TableBody>
                </Table></>}

            {loadedPage === 2 && <><Table>
                <TableBody>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            <h3>Tags
                                <Tooltip title=" Tags are used to discover datasets.">
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </h3>
                        </TableCell>
                    </TableRow>

                </TableBody>
            </Table>
                <Table>
                    <TableBody>

                        <TableRow>
                            <TableCell className='col-6'>Tags:</TableCell>
                            <TableCell className='col-6'>
                                <TextField
                                    id="Tag"
                                    label="Tag"
                                    variant="filled"
                                    sx={{
                                        background: 'rgb(255, 255, 255)',
                                        color: 'rgb(0, 0, 0)',
                                        marginBottom: '10px' // Add some space between the input and the tags
                                    }}
                                    value={tag}
                                    onChange={event => { setTag(event.target.value) }}
                                />
                                <IconButton onClick={() => addTag()}>
                                    <AddIcon />
                                </IconButton>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                                    {tags.map((tag, index) => (
                                        <Chip
                                            key={index}
                                            label={tag}
                                            onDelete={() => deleteTag(tag)}
                                            sx={{ margin: 0.5 }}
                                        />
                                    ))}
                                </Box>
                            </TableCell>
                        </TableRow>


                    </TableBody>
                </Table></>}
            {loadedPage === 3 && <><Table>
                <TableBody>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            <h3>Column Information
                                <Tooltip title="Our system will auto detect data types if you leave the column as AUTO. However if you would like individual words to be parsed and preprocessed please signify that as a TEXT column">
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </h3>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
                <Table>
                    <TableBody>
                        {headers.map((header) => (
                            <TableRow key={header}> {/* It's better to use a unique key here */}
                                <TableCell className='col-6'>
                                    {header}
                                </TableCell>
                                <TableCell className='col-6'>
                                    <FormControl fullWidth>
                                        <Select
                                            defaultValue="AUTO"
                                            value={columnTypes[header] || 'AUTO'} // Fallback to 'AUTO' if undefined
                                            onChange={(event) => setColumnTypes({ ...columnTypes, [header]: event.target.value })}
                                            sx={{
                                                background: 'rgb(255, 255, 255)',
                                                color: 'rgb(0, 0, 0)'
                                            }}
                                        >
                                            <MenuItem value="AUTO">AUTO</MenuItem>
                                            <MenuItem value="TEXT">TEXT</MenuItem>
                                            <MenuItem value="DATE">DATE</MenuItem>
                                            <MenuItem value="NUMERIC">NUMERIC</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table></>}
            <Table
                sx={{
                    width: "100%"
                }}>
                <TableBody>
                    <TableRow >

                        {loadedPage === 1 && <TableCell className='col-6'>
                            <Button
                                variant="contained"
                                primary
                                onClick={() => props.CancelUpload()}
                            >
                                Cancel
                            </Button>
                        </TableCell>}
                        {loadedPage > 1 && <TableCell className='col-6'>
                            <Button
                                variant="contained"
                                primary
                                onClick={() => setLoadedPage(loadedPage - 1)}
                            >
                                Back
                            </Button>
                        </TableCell>}
                        {loadedPage < 3 && <TableCell className='col-6'>
                            <div className='float-right'></div>
                            {FilledOut() && <Button
                                variant="contained"
                                primary
                                onClick={() => setLoadedPage(loadedPage + 1)}
                            >
                                Next
                            </Button>}
                            {!FilledOut() && <Button
                                variant="contained"
                                primary
                                disabled
                            >
                                Next
                            </Button>}
                        </TableCell>}
                        {loadedPage === 3 && <TableCell className='col-6'>
                            <div className='float-right'></div>
                            {FilledOut() && <Button
                                variant="contained"
                                primary
                                onClick={() => SendDataset()}
                            >
                                Submit Dataset
                            </Button>}
                            {!FilledOut() && <Button
                                variant="contained"
                                primary
                                disabled
                            >
                                Submit Dataset
                            </Button>}
                        </TableCell>}
                    </TableRow>
                </TableBody>
            </Table>
        </Box>
    )
}

