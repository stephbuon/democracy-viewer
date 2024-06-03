import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

// MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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
    const params = useParams();

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
    const [useAPI, setUseAPI] = useState(false);
    const [apidatasetname, setApidatasetname] = useState(undefined);
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');

    const FilledOut = () => {
        if (loadedPage === 1) {
            if (!title || !description) { return false; }
        } else if (loadedPage === 2) {
            if (tags.length < 3) { return false; }
        }
        return true;
    }

    const addTag = () => {
        if (tag.trim() === "") return;
        let _tags = [...tags];
        _tags.push(tag);
        setTags(_tags);
        setTag('');
    }

    const deleteTag = (_tag) => {
        let _tags = tags;
        let index = _tags.indexOf(_tag);
        if (index > -1) {
            _tags.splice(index, 1);
        }
        setTags([..._tags]);
    }

    const SendDataset = () => {
        let _texts = [];
        for (let i = 0; i < headers.length; i++) {
            if (columnTypes[headers[i]] === "TEXT") {
                _texts.push(headers[i]);
            }
        }
        if (!useAPI) {
            CreateDataset(props.file).then(async (datasetname) => {
                let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
                demoV.uploadData = datasetname;
                localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
                if (_texts.length > 0) {
                    AddTextColumn(datasetname, _texts);
                }
                if (tags.length > 0) {
                    AddTags(datasetname, tags);
                }
                UploadDataset(datasetname);
                UpdateMetadata(datasetname, title, description, publicPrivate);
                setTimeout(() => {
                    window.open("http://localhost:3000/uploadProgress", "_blank", "noopener,noreferrer");
                }, 1000);
            });
        } else {
            let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
            demoV.uploadData = apidatasetname;
            localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
            UploadDataset(apidatasetname);
            UpdateMetadata(apidatasetname, title, description, publicPrivate);
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
        if (props.useAPI) {
            setUseAPI(true);
            setApidatasetname(props.apidatasetname);
            setTitle(props.apidatasetname);
        } else {
            setTitle(props.file.name.substr(0, props.file.name.length - 4))
        }
        setHeaders(props.headers)
    }, [props]);

    useEffect(() => {
    }, [columnTypes]);

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
            <Box sx={{
                width: '100%',
                mb: 3,
                '& .MuiLinearProgress-root': {
                    height: '10px',
                    borderRadius: '5px'
                }
            }}>
                <LinearProgress variant="determinate" value={(loadedPage / 3) * 100} />
            </Box>

            {loadedPage === 1 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Dataset Information
                        <Tooltip title="Provide general information about the dataset. Noticed that the information will be shared to public if you select 'public' for privacy.">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            id="Title"
                            label="Title"
                            variant="filled"
                            fullWidth
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={title}
                            onChange={event => { setTitle(event.target.value); }}
                        />
                        <TextField
                            id="Author"
                            label="Author"
                            variant="filled"
                            fullWidth
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={author}
                            onChange={event => { setAuthor(event.target.value); }}
                        />
                        <TextField
                            id="Date"
                            label="Date"
                            type="date"
                            variant="filled"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={date}
                            onChange={event => { setDate(event.target.value); }}
                        />
                        <TextField
                            id="Description"
                            label="Description"
                            variant="filled"
                            fullWidth
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={description}
                            onChange={event => { setDescription(event.target.value); }}
                        />
                        <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                            <InputLabel>Privacy</InputLabel>
                            <Select
                                value={publicPrivate}
                                onChange={event => setPublicPrivate(event.target.value)}
                            >
                                <MenuItem value={true}>Public</MenuItem>
                                <MenuItem value={false}>Private</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            )}

            {loadedPage === 2 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Tags
                        <Tooltip title="Tags are used to discover datasets.">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                id="Tag"
                                label="Tag"
                                variant="filled"
                                fullWidth
                                sx={{ background: 'rgb(255, 255, 255)' }}
                                value={tag}
                                onChange={event => { setTag(event.target.value); }}
                            />
                            <IconButton onClick={() => addTag()}>
                                <AddIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => deleteTag(tag)}
                                    sx={{ margin: 0.5 }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}

            {loadedPage === 3 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Column Information
                        <Tooltip title="Our system will auto detect data types if you leave the column as AUTO. However if you would like individual words to be parsed and preprocessed please signify that as a TEXT column">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {headers.map((header, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ flex: 1 }}>{header}</Typography>
                                <FormControl fullWidth variant="filled" sx={{ flex: 2, background: 'rgb(255, 255, 255)' }}>
                                    <Select
                                        value={columnTypes[header] || 'AUTO'}
                                        onChange={(event) => setColumnTypes({ ...columnTypes, [header]: event.target.value })}
                                    >
                                        <MenuItem value="AUTO">AUTO</MenuItem>
                                        <MenuItem value="TEXT">TEXT</MenuItem>
                                        <MenuItem value="DATE">DATE</MenuItem>
                                        <MenuItem value="NUMERIC">NUMERIC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                {loadedPage > 1 && (
                    <Button
                        variant="contained"
                        onClick={() => setLoadedPage(loadedPage - 1)}
                    >
                        Back
                    </Button>
                )}
                {loadedPage < 3 && (
                    <Button
                        variant="contained"
                        disabled={!FilledOut()}
                        onClick={() => setLoadedPage(loadedPage + 1)}
                    >
                        Next
                    </Button>
                )}
                {loadedPage === 3 && (
                    <Button
                        variant="contained"
                        disabled={!FilledOut()}
                        onClick={() => SendDataset()}
                    >
                        Submit Dataset
                    </Button>
                )}
                {loadedPage === 1 && (
                    <Button
                        variant="contained"
                        onClick={() => props.CancelUpload()}
                    >
                        Cancel
                    </Button>
                )}
            </Box>
        </Box>
    );
}
