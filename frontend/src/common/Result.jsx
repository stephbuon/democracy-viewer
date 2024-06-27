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
                        <Button variant="outlined" onClick={() => setInfoOpen(true)}>
                            Edit
                        </Button>
                        <AlertDialog
                            open={infoOpen}
                            setOpen={setInfoOpen}
                            titleText={`Edit dataset "${dataset.title}"`}
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

                        <Button variant="outlined" onClick={() => setTagsOpen(true)}>
                            Edit Tags
                        </Button>
                        <AlertDialog
                            open={tagsOpen}
                            setOpen={setTagsOpen}
                            titleText={`Edit dataset "${dataset.title}"`}
                            bodyText={
                                <DatasetTags
                                    tags={tags}
                                    setTags={setTags}
                                />
                            }
                            action={() => updateTags()}
                        />

                        <Button variant="outlined" onClick={() => setDeleteOpen(true)}>
                            Delete
                        </Button>
                        <AlertDialog
                            open={deleteOpen}
                            setOpen={setDeleteOpen}
                            titleText={`Are you sure you want to delete the dataset "${dataset.title}"?`}
                            bodyText={"This action cannot be undone."}
                            action={() => deleteDataset(dataset.table_name).then(x => window.location.reload())}
                        />
                    </>
                }

                {
                    loggedIn && !dataset.liked &&
                    <Button variant="outlined" onClick={() => like()}>
                        Bookmark
                    </Button>
                }

                {
                    loggedIn && dataset.liked &&
                    <Button variant="outlined" onClick={() => dislike()}>
                        Unbookmark
                    </Button>
                }
                
                <Table sx={{ border: 'none' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    borderBottom: 'none'
                                }}>
                                {dataset.title}
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none' }}>
                                &nbsp;
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none' }}>
                                {dataset.is_public && "Public"}
                                {!dataset.is_public && "Private"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.15rem' }}>
                                Dataset Uploader:
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.05rem' }}>
                                {dataset.username}
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none' }} />
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ borderBottom: 'none', fontSize: '1.15rem' }}>
                                Description:
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.05rem' }}>
                                {dataset.description}
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none' }} />
                        </TableRow>

                        {
                            dataset.author &&
                            <TableRow>
                                <TableCell sx={{ borderBottom: 'none' ,fontSize: '1.15rem', width: '300px'}}>
                                    Data Source/ Author:
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none' ,fontSize: '1.05rem'}}>
                                    {dataset.author}
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none' }} />
                            </TableRow>
                        }

                        {
                            dataset.date_collected &&
                            <TableRow>
                                <TableCell sx={{ borderBottom: 'none' ,fontSize: '1.15rem'}}>
                                    Date Collected:
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none' ,fontSize: '1.05rem'}}>
                                    {dataset.date_collected}
                                </TableCell>
                                <TableCell sx={{ borderBottom: 'none' }} />
                            </TableRow>
                        }

                        <TableRow>
                            <TableCell sx={{ borderBottom: 'none' ,fontSize: '1.15rem'}}>
                                Views:
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.05rem' }}>
                                {dataset.clicks}
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none' }} />
                        </TableRow>

                        <TableRow>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.15rem' }}>
                                Likes:
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.05rem' }}>
                                {dataset.likes}
                            </TableCell>
                            <TableCell sx={{ borderBottom: 'none' }} />
                        </TableRow>
                    </TableBody>
                </Table>
                <Table sx={{ border: 'none' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ borderBottom: 'none',fontSize: '1.15rem' }}>
                                Tags:
                            </TableCell>
                            {dataset.tags.map((tag, index) => {
                                if (index < 5) {
                                    return <TableCell key={index} sx={{ borderBottom: 'none' }}>
                                        {tag}
                                    </TableCell>
                                }
                            })}
                            {dataset.tags.length < 1 && <TableCell key={1} sx={{ borderBottom: 'none' }} />}
                            {dataset.tags.length < 2 && <TableCell key={2} sx={{ borderBottom: 'none' }} />}
                            {dataset.tags.length < 3 && <TableCell key={3} sx={{ borderBottom: 'none' }} />}
                            {dataset.tags.length < 4 && <TableCell key={4} sx={{ borderBottom: 'none' }} />}
                            {dataset.tags.length < 5 && <TableCell key={5} sx={{ borderBottom: 'none' }} />}
                            {dataset.tags.length < 6 && <TableCell key={6} sx={{ borderBottom: 'none' }} />}
                            {dataset.tags.length > 5 && <TableCell key={'...'} sx={{ borderBottom: 'none' }}>
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
                        marginTop: '.5em'
                    }}>
                    <Button
                        variant="contained"
                        primary
                        sx={{
                            marginX: '1em'
                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/subsetSearch');
                        }}
                    >
                        Advanced search Data
                    </Button>
                    <Button
                        variant="contained"
                        primary
                        sx={{
                            marginX: '1em'
                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/graph');
                        }}
                    >
                        Visualize Data
                    </Button>
                </Box>
            </Box>
        </Modal>

    </div>
}
