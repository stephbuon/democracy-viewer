
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, TableRow, TableCell } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Popularize } from '../apiFolder/DatasetSearchAPI';
import { AlertDialog } from './AlertDialog';
import { deleteDataset, addLike, deleteLike } from '../api/api';
import { UpdateMetadata, AddTags, DeleteTag } from '../apiFolder/DatasetUploadAPI';
import { DatasetInformation } from './DatasetInformation';
import { DatasetTags } from './DatasetTags';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

export const Result = (props) => {
    const navigate = useNavigate();

    const [loggedIn, setLoggedIn] = useState(false);
    const [dataset, setDataset] = useState(props.result);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [title, setTitle] = useState(dataset.title);
    const [publicPrivate, setPublicPrivate] = useState(dataset.is_public);
    const [description, setDescription] = useState(dataset.description);
    const [author, setAuthor] = useState(dataset.author);
    const [date, setDate] = useState(dataset.date);
    const [tags, setTags] = useState(dataset.tags);

    // Open edit dialogs
    const [infoOpen, setInfoOpen] = useState(false);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [infoDisabled, setInfoDisabled] = useState(true);
    const [tagsDisabled, setTagsDisabled] = useState(true);

    const chooseDataset = () => {
        Popularize(dataset.table_name)
        props.setDataset(dataset);
    }

    const updateInfo = () => {
        const params = {
            title: title !== dataset.title ? title : null,
            is_public: publicPrivate !== dataset.is_public ? publicPrivate : null,
            description: description !== dataset.description ? description : null,
            author: author !== dataset.author ? author : null,
            date: date !== dataset.date ? date : null
        };

        const keys = Object.keys(params).filter(x => params[x] === null);
        keys.forEach(x => delete params[x]);

        UpdateMetadata(dataset.table_name, params).then(x => {
            const newDataset = { ...x, tags };
            setDataset(newDataset);
            props.setDataset(newDataset);
        });
    }

    const updateTags = () => {
        const newTags = tags.filter(x => dataset.tags.indexOf(x) === -1);
        const deletedTags = dataset.tags.filter(x => tags.indexOf(x) === -1);

        AddTags(dataset.table_name, newTags);
        deletedTags.forEach(x => DeleteTag(dataset.table_name, x));

        const newDataset = { ...dataset, tags };
        setDataset(newDataset);
        props.setDataset(newDataset);
    }

    const like = () => {
        addLike(dataset.table_name);

        const newDataset = { ...dataset, liked: true, likes: dataset.likes + 1 };
        setDataset(newDataset);
        props.setDataset(newDataset);
    }

    const dislike = () => {
        deleteLike(dataset.table_name);

        const newDataset = { ...dataset, liked: false, likes: dataset.likes - 1 };
        setDataset(newDataset);
        props.setDataset(newDataset);
    }

    useEffect(() => {
        if (infoDisabled && (title !== dataset.title || publicPrivate !== dataset.is_public || description !== dataset.description || author !== dataset.author || date !== dataset.date)) {
            setInfoDisabled(false);
        } else if (!infoDisabled && (title === dataset.title || publicPrivate === dataset.is_public || description === dataset.description || author === dataset.author || date === dataset.date)) {
            setInfoDisabled(true);
        }
    }, [title, publicPrivate, description, author, date]);

    useEffect(() => {
        if (tagsDisabled && JSON.stringify(tags.sort()) !== JSON.stringify(dataset.tags.sort())) {
            setTagsDisabled(false);
        } else if (!tagsDisabled && JSON.stringify(tags.sort()) === JSON.stringify(dataset.tags.sort())) {
            setTagsDisabled(true);
        }
    }, [tags]);

    useEffect(() => {
        setDataset(props.result);

        const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV && demoV.user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [props.result]);

    return <div>
        <Box onClick={() => handleOpen()}>
            {dataset.title}
        </Box>
        <Modal
            open={open}
            onClose={() => handleClose()}
        >
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
                {
                    props.editable && <>
                        <Button 
                            variant="contained" 
                            disableElevation
                            sx={{ 
                                borderRadius: 0, 
                                bgcolor: '#B3B3B3', 
                                color: 'white' }} 
                            onClick={() => setInfoOpen(true)}>
                            Edit
                        </Button>
                        <AlertDialog
                            open={infoOpen}
                            setOpen={setInfoOpen}
                            titleText={`Edit dataset "${ dataset.title }"`}
                            bodyText={
                                <DatasetInformation
                                    title={title}
                                    setTitle={setTitle}
                                    author={author}
                                    setAuthor={setAuthor}
                                    date={date}
                                    setDate={setDate}
                                    description={description}
                                    setDescription={setDescription}
                                    publicPrivate={publicPrivate}
                                    setPublicPrivate={setPublicPrivate}
                                />
                            }
                            action={() => updateInfo()}
                        />
                    
                        <Button 
                            variant="contained" 
                            disableElevation
                            sx={{  
                                borderRadius: 0, 
                                bgcolor: '#B3B3B3', 
                                color: 'white' }} 
                            onClick={() => setTagsOpen(true)}>
                            Edit Tags
                        </Button>
                        <AlertDialog
                            open={tagsOpen}
                            setOpen={setTagsOpen}
                            titleText={`Edit dataset "${ dataset.title }"`}
                            bodyText={
                                <DatasetTags
                                    tags={tags}
                                    setTags={setTags}
                                />
                            }
                            action={() => updateTags()}
                        />

                        <Button 
                        variant="contained" 
                        disableElevation
                        sx={{  
                            borderRadius: 0, 
                            bgcolor: '#B3B3B3', 
                            color: 'white' }} 
                        onClick={() => setDeleteOpen(true)}>
                            Delete
                        </Button>
                        <AlertDialog
                            open={deleteOpen}
                            setOpen={setDeleteOpen}
                            titleText={`Are you sure you want to delete the dataset "${ dataset.title }"?`}
                            bodyText={"This action cannot be undone."}
                            action={() => deleteDataset(dataset.table_name).then(x => window.location.reload())}
                        />
                    </>
                }

                {
                    loggedIn && !dataset.liked &&
                    <Button 
                    variant="contained" 
                    disableElevation
                    sx={{  
                        borderRadius: 0, 
                        bgcolor: '#B3B3B3', 
                        color: 'white' }} 
                    endIcon={<BookmarkBorderIcon />} 
                    onClick={() => like()}>
                        Bookmark
                    </Button>
                }

                {
                    loggedIn && dataset.liked &&
                    <Button 
                    variant="contained" 
                    disableElevation
                    sx={{  
                        borderRadius: 0, 
                        bgcolor: '#B3B3B3', 
                        color: 'white' }} 
                    endIcon={<BookmarkIcon />} 
                    onClick={() => dislike()}>
                        Remove Bookmark
                    </Button>
                }
                
                <Table>
                    <TableHead>
                        
                        <TableRow>
                            <TableCell
                                sx={{
                                    paddingTop: "20px", 
                                    align: 'center'

                                }}>
                                <b>{dataset.title}</b>
                            </TableCell>
                            <TableCell>
                                &nbsp;
                            </TableCell>
                            <TableCell>
                                {dataset.is_public && "Public"}
                                {!dataset.is_public && "Private"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <b> Author </b>
                            </TableCell>
                            <TableCell>
                                {dataset.username}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <b> Description </b>
                            </TableCell>
                            <TableCell>
                                {dataset.description}
                            </TableCell>
                            <TableCell />
                        </TableRow>

                        {
                            dataset.author &&
                            <TableRow>
                                <TableCell>
                                    <b> Source </b>
                                </TableCell>
                                <TableCell>
                                    {dataset.author}
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        }

                        {
                            dataset.date_collected &&
                            <TableRow>
                                <TableCell>
                                    Date Collected:
                                </TableCell>
                                <TableCell>
                                    {dataset.date_collected}
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        }

                        <TableRow>
                            <TableCell>
                                <b> Views </b>
                            </TableCell>
                            <TableCell>
                                {dataset.clicks}
                            </TableCell>
                            <TableCell />
                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Likes </b>
                            </TableCell>
                            <TableCell>
                                {dataset.likes}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <b> Tags </b>
                            </TableCell>
                            {dataset.tags.map((tag, index) => {
                                if (index < 5) {
                                    return <TableCell key={index}>
                                        {tag}
                                    </TableCell>
                                }
                            })}
                            {dataset.tags.length < 1 && <TableCell key={1} />}
                            {dataset.tags.length < 2 && <TableCell key={2} />}
                            {dataset.tags.length < 3 && <TableCell key={3} />}
                            {dataset.tags.length < 4 && <TableCell key={4} />}
                            {dataset.tags.length < 5 && <TableCell key={5} />}
                            {dataset.tags.length < 6 && <TableCell key={6} />}
                            {dataset.tags.length > 5 && <TableCell key={'...'}>
                                ...
                            </TableCell>}

                        </TableRow>
                    </TableBody>
                </Table>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '3em'
                    }}>

                </Box>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '.5em'
                    }}>
                    <Button
                        variant="contained"
                        primary
                        sx={{
                            marginX: '1em',
                            borderRadius: 50, 
                            bgcolor: 'black', 
                            color: 'white'
                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/subsetSearch');
                        }}
                    >
                        Search Data
                    </Button>
                    <Button
                        variant="contained"
                        primary
                        sx={{
                            marginX: '1em',
                            borderRadius: 50, 
                            bgcolor: 'black', 
                            color: 'white'
                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/graph');
                        }}
                    >
                        Graph Data
                    </Button>
                </Box>
            </Box>
        </Modal>

    </div>
}