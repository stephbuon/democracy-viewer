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

    // const fs = require('fs');
    // const readline = require('readline');

    const FilledOut = () => {
        if (title && description) { return true }
        else { return false; }
    }

    const addTag = () => {
        let _tags = tags
        _tags.push(tag)
        setTags(_tags);
        console.log("New tags", _tags)
        setTag('')
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
        CreateDataset(props.file).then(async (datasetname) => {
            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            demoV.uploadData = datasetname;
            localStorage.setItem('democracy-viewer', JSON.stringify(demoV))
            UploadDataset(datasetname)
            UpdateMetadata(datasetname, title, description, publicPrivate)
            if (_texts.length > 0) {
                AddTextColumn(datasetname, _texts);
            }
            if (tags.length > 0) {
                AddTags(datasetname, tags);
            }

        }).then(() => { window.open("http://localhost:3000/uploadProgress", "_blank", "noopener,noreferrer"); })
        props.CancelUpload();
        return;
    }
    // useEffect(() => {
    //    if (send)
    //    {


    //     let _texts = [];

    //     let demoV = JSON.parse(localStorage.getItem('democracy-viewer'))
    //     demoV.upload_query = 
    //     {
    //         _texts: _texts,
    //         tags: tags,
    //         title: title,
    //         description: description,
    //         publicPrivate: publicPrivate
    //     }
    //     console.log("upload",demoV.upload_query)
    //     localStorage.setItem('democracy-viewer', JSON.stringify(demoV))

    // }
    //     setSend(true);
    // }, [props.uploadFile]);

    const loggedIn = () => {
        //check if user is logged in
        //for now will return false since system is not hooked up
        return false;
    }




    useEffect(() => {
        console.log("Props", props)
        setTitle(props.file.name.substr(0, props.file.name.length - 4))
        setHeaders(props.headers)
    }, []);

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
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            <h2>Upload Dataset</h2>
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
                            <h3>Dataset Information</h3>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            This is some information that our system needs so that we can help people searching for you dataset, or make it to where only you can access the data. We would love for others to be able to use the data you are providing as a way to grow this tool, however we understand if you do not want that to happen.
                            </TableCell>
                    </TableRow>
                </TableBody>
                </Table>
                <Table>
                <TableBody>
                    <TableRow>
                        <TableCell className='col-6'>
                            Dataset Title:
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
                            Dataset Description:
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
                                    <MenuItem value={false} >Private</MenuItem>
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
                            <h3>Tags</h3>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            Please consider tagging your dataset with any relevant descriptors. This will help people searching for your dataset, or similar datasets
                            </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Table>
                <TableBody>

                    <TableRow>
                        <TableCell className='col-6'>
                            Tags:
                        </TableCell>
                        <TableCell className='col-6'>
                            <TextField
                                id="Tag"
                                label="Tag"
                                variant="filled"
                                sx={{
                                    background: 'rgb(255, 255, 255)',
                                    color: 'rgb(0, 0, 0)'
                                }}
                                value={tag}
                                onChange={event => { setTag(event.target.value) }}
                            />
                            <IconButton onClick={() => addTag()}>
                                <AddIcon />
                            </IconButton>
                        </TableCell>
                    </TableRow>

                    {tags.map((_tag) => {
                        return <TableRow id={_tag.idx}>
                            <TableCell className='col-6'>&nbsp;</TableCell>
                            <TableCell className='col-6'>
                                {_tag}
                                <IconButton aria-label="delete" onClick={() => deleteTag(_tag)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table></>}
            {loadedPage === 3 && <><Table>
                <TableBody>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            <h3>Column Information</h3>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                textAlign: 'center'
                            }}>
                            Note: Our system will auto detect data types if you leave the column blank. However if you would like individual words to be parsed please signify that as a "TEXT" column
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
                <Table>
                    <TableBody>

                        {/* ADD COLUMN DETECTION STUFF HERE */}


                        {headers.map((header => {
                            return <TableRow id={header}>
                                <TableCell className='col-6'>
                                    {header}
                                </TableCell>
                                <TableCell className='col-6'>
                                    <FormControl>
                                        <Select
                                            defaultValue="AUTO"
                                            value={columnTypes[header]}
                                            onChange={event => setColumnTypes({ ...columnTypes, [header]: event.target.value })}
                                            sx={{
                                                background: 'rgb(255, 255, 255)',
                                                color: 'rgb(0, 0, 0)'
                                            }}
                                        >
                                            <MenuItem value={"AUTO"}>AUTO</MenuItem>
                                            <MenuItem value={"TEXT"}>TEXT</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        }))}


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