import {
    Box, Button, ButtonGroup, Modal,
    Table, TableBody, TableHead, TableRow, TableCell, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { AlertDialog } from '../AlertDialog';
import { DatasetTags, DatasetInformation } from '../metadata';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { Link } from 'react-router-dom';
import { reprocessDataset, getUser, deleteDataset, addLike, deleteLike, UpdateMetadata, AddTags, DeleteTag, Popularize } from '../../../api';

export const ResultModal = (props) => {
    const navigate = useNavigate();

    const handleClose = () => props.setOpen(false);

    const [userName, setUserName] = useState(undefined);
    const [title, setTitle] = useState(props.dataset.title);
    const [publicPrivate, setPublicPrivate] = useState(props.dataset.is_public);
    const [description, setDescription] = useState(props.dataset.description);
    const [author, setAuthor] = useState(props.dataset.author);
    const [date, setDate] = useState(props.dataset.date);
    const [tags, setTags] = useState(props.dataset.tags);
    const [license, setLicense] = useState(props.dataset.license);
    // Minimum number of required changes to reprocess a dataset
    const [reprocessThreshold, setReprocessThreshold] = useState(5);
    const [reprocessConfirmOpen, setReprocessConfirmOpen] = useState(false);

    // Open edit dialogs
    const [infoOpen, setInfoOpen] = useState(false);
    const [tagsOpen, setTagsOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [infoDisabled, setInfoDisabled] = useState(true);
    const [tagsDisabled, setTagsDisabled] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const chooseDataset = () => {
        Popularize(props.dataset.table_name)
        props.setDataset(props.dataset);
    }

    const updateInfo = () => {
        const params = {
            title: title !== props.dataset.title ? title : null,
            is_public: publicPrivate !== props.dataset.is_public ? publicPrivate : null,
            description: description !== props.dataset.description ? description : null,
            author: author !== props.dataset.author ? author : null,
            date: date !== props.dataset.date ? date : null,
            license: license !== props.dataset.license ? license : null
        };

        const keys = Object.keys(params).filter(x => params[x] === null);
        keys.forEach(x => delete params[x]);

        UpdateMetadata(props.dataset.table_name, params).then(x => {
            const newDataset = { ...x, tags };
            props.setDataset(newDataset);
        });
    }

    const updateTags = () => {
        const newTags = tags.filter(x => !props.dataset.tags.includes(x));
        const deletedTags = props.dataset.tags.filter(x => !tags.includes(x));

        if (newTags.length > 0) {
            AddTags(props.dataset.table_name, newTags);
        }
        deletedTags.forEach(x => DeleteTag(props.dataset.table_name, x));

        const newDataset = { ...props.dataset, tags };
        props.setDataset(newDataset);
        props.setDataset(newDataset);
    }

    const like = () => {
        addLike(props.dataset.table_name);

        const newDataset = { ...props.dataset, liked: true, likes: props.dataset.likes + 1 };
        props.setDataset(newDataset);
    }

    const dislike = () => {
        deleteLike(props.dataset.table_name);

        const newDataset = { ...props.dataset, liked: false, likes: props.dataset.likes - 1 };
        props.setDataset(newDataset);
    }

    const onDelete = () => {
        deleteDataset(props.dataset.table_name).then(x => {
            if (props.deleteCallback) {
                props.deleteCallback();
            } else {
                window.location.reload();
            }
        });
    }

    useEffect(() => {
        if (infoDisabled && (title !== props.dataset.title || publicPrivate != props.dataset.is_public || description !== props.dataset.description || author !== props.dataset.author || date !== props.dataset.date)) {
            setInfoDisabled(false);
        } else if (!infoDisabled && title === props.dataset.title && publicPrivate == props.dataset.is_public && description === props.dataset.description && (!props.dataset.author || author === props.dataset.author) && (!date === props.dataset.date || date === props.dataset.date)) {
            setInfoDisabled(true);
        }
    }, [title, publicPrivate, description, author, date]);

    useEffect(() => {
        if (tagsDisabled && JSON.stringify(tags.sort()) !== JSON.stringify(props.dataset.tags.sort())) {
            setTagsDisabled(false);
        } else if (!tagsDisabled && JSON.stringify(tags.sort()) === JSON.stringify(props.dataset.tags.sort())) {
            setTagsDisabled(true);
        }
    }, [tags]);

    useEffect(() => {
        if (props.open && !userName) {
            getUser(props.dataset.email).then(user => setUserName(`${user.first_name} ${user.last_name}`));
        }
    }, [props.open]);

    return <>
        <Modal
            open={props.open}
            onClose={() => handleClose()}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '7.5%',
                    left: '15%',
                    height: "75%",
                    overflow: "scroll",
                    width: "70%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em",
                    paddingBottom: "15px"
                }}
            >
                <ButtonGroup
                    sx={{
                        width: "100%"
                    }}>
                    {
                        props.editable === true && <>
                            <Button
                                variant="contained"
                                disableElevation
                                fullWidth={true}
                                sx={{
                                    borderRadius: 0,
                                    width: "100%",
                                    bgcolor: '#B3B3B3',
                                    color: 'white'
                                }}
                                onClick={() => setInfoOpen(true)}>
                                Edit
                            </Button>
                            <AlertDialog
                                open={infoOpen}
                                setOpen={setInfoOpen}
                                titleText={`Edit Dataset "${props.dataset.title}"`}
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
                                        license={license}
                                        setLicense={setLicense}
                                        disabled={disabled}
                                        setDisabled={setDisabled}
                                    />
                                }
                                action={() => updateInfo()}
                                disabled={disabled || infoDisabled}
                            />
                            <Button
                                variant="contained"
                                disableElevation
                                fullWidth={true}
                                sx={{
                                    borderRadius: 0,
                                    width: "100%",
                                    bgcolor: '#B3B3B3',
                                    color: 'white'
                                }}
                                onClick={() => setTagsOpen(true)}>
                                Edit Tags
                            </Button>
                            <AlertDialog
                                open={tagsOpen}
                                setOpen={setTagsOpen}
                                titleText={`Edit dataset "${props.dataset.title}"`}
                                bodyText={
                                    <DatasetTags
                                        tags={tags}
                                        setTags={setTags}
                                    />
                                }
                                action={() => updateTags()}
                                disabled={tagsDisabled}
                            />

                            <Button
                                variant="contained"
                                disableElevation
                                fullWidth={true}
                                sx={{
                                    borderRadius: 0,
                                    width: "100%",
                                    bgcolor: '#B3B3B3',
                                    color: 'white'
                                }}
                                onClick={() => setDeleteOpen(true)}
                            >
                                Delete
                            </Button>
                            <AlertDialog
                                open={deleteOpen}
                                setOpen={setDeleteOpen}
                                titleText={`Are you sure you want to delete the dataset "${props.dataset.title}"?`}
                                bodyText={"This action cannot be undone."}
                                action={() => onDelete()}
                            />
                        </>
                    }
                    {
                        props.loggedIn && props.dataset.liked === false &&
                        <Button
                            variant="contained"
                            disableElevation
                            fullWidth={true}
                            sx={{
                                borderRadius: 0,
                                width: "100%",
                                bgcolor: 'black',
                                color: 'white'
                            }}
                            endIcon={<BookmarkBorderIcon />}
                            onClick={() => like()}>
                            Bookmark
                        </Button>
                    }

                    {
                        props.loggedIn && props.dataset.liked === true &&
                        <Button
                            variant="contained"
                            disableElevation
                            fullWidth={true}
                            sx={{
                                borderRadius: 0,
                                width: "100%",
                                bgcolor: '#B3B3B3',
                                color: 'white'
                            }}
                            endIcon={<BookmarkIcon />}
                            onClick={() => dislike()}>
                            Remove Bookmark
                        </Button>
                    }
                </ButtonGroup>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '2em'
                    }}>
                    {
                        props.dataset.uploaded == true &&
                        <div>
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
                                    navigate('/datasets/subsets/search');
                                }}
                            >
                                Subset Search
                            </Button>
                        </div>

                    }

                    {
                        props.dataset.uploaded == false &&
                        <Tooltip arrow title="Subset search for this dataset has been disabled until the dataset is fully uploaded">
                            <div>
                                <Button
                                    variant="contained"
                                    primary
                                    sx={{
                                        marginX: '1em',
                                        borderRadius: 50,
                                        bgcolor: 'black',
                                        color: 'white'
                                    }}
                                    disabled
                                >
                                    Subset Search
                                </Button>
                            </div>
                        </Tooltip>
                    }

                    {
                        props.dataset.tokens_done == true &&
                        <div>
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
                                Visualize
                            </Button>
                        </div>
                    }

                    {
                        (props.dataset.uploaded === false || props.dataset.tokens_done == false) &&
                        <Tooltip arrow title="Graphing for this dataset has been disabled until processing is complete">
                            <div>
                                <Button
                                    variant="contained"
                                    primary
                                    sx={{
                                        marginX: '1em',
                                        borderRadius: 50,
                                        bgcolor: 'black',
                                        color: 'white'
                                    }}
                                    disabled
                                >
                                    Visualize
                                </Button>
                            </div>
                        </Tooltip>
                    }

                    {
                        props.editable == true && 
                        <>
                            {
                                props.dataset.reprocess_start === true &&
                                <Tooltip arrow title="This dataset is currently reprocessing. You will be sent a confirmation email when reprocessing is complete.">
                                    <div>
                                        <Button
                                            variant="contained"
                                            primary
                                            sx={{
                                                marginX: '1em',
                                                borderRadius: 50,
                                                bgcolor: 'black',
                                                color: 'white'
                                            }}
                                            disabled
                                        >
                                            Reprocess Dataset
                                        </Button>
                                    </div>
                                </Tooltip>
                            }

                            {
                                props.dataset.reprocess_start === false && props.dataset.unprocessed_updates < reprocessThreshold &&
                                <Tooltip arrow title={`This dataset requires ${ reprocessThreshold } unprocessed changes to enable reprocessing.`}>
                                    <div>
                                        <Button
                                            variant="contained"
                                            primary
                                            sx={{
                                                marginX: '1em',
                                                borderRadius: 50,
                                                bgcolor: 'black',
                                                color: 'white'
                                            }}
                                            disabled
                                        >
                                            Reprocess Dataset
                                        </Button>
                                    </div>
                                </Tooltip>
                            }

                            {
                                props.dataset.reprocess_start === false && props.dataset.unprocessed_updates >= reprocessThreshold &&
                                <>
                                    <AlertDialog
                                        open={reprocessConfirmOpen}
                                        setOpen={setReprocessConfirmOpen}
                                        titleText={`Are you sure you want to reprocess the dataset "${props.dataset.title}"?`}
                                        bodyText={"This may result in the dataset being temporarily disabled. You will be send a confirmation email when reprocessing is complete."}
                                        action={() => {
                                            reprocessDataset(props.dataset.table_name);
                                            setReprocessConfirmOpen(false);
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        primary
                                        sx={{
                                            marginX: '1em',
                                            borderRadius: 50,
                                            bgcolor: 'black',
                                            color: 'white'
                                        }}
                                        onClick={() => setReprocessConfirmOpen(true)}
                                    >
                                        Reprocess Dataset
                                    </Button>
                                </>
                            }
                        </>
                    }
                </Box>

                <Table sx={{ border: 'none' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    paddingTop: "40px",
                                    align: 'center'

                                }}>
                                <b>{props.dataset.title}</b>
                            </TableCell>
                            <TableCell
                                sx={{
                                    textAlign: "left",
                                    paddingTop: "40px"
                                }}>
                                {props.dataset.is_public == 1 && <span>Public</span>}
                                {props.dataset.is_public == 0 && <span>Private</span>}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <b> Author </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <Link to={`/profile/${props.dataset.email}`}>
                                    {
                                        userName !== undefined && userName
                                    }

                                    {
                                        userName === undefined && props.dataset.email
                                    }
                                </Link>
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <b> Description </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.dataset.description}
                            </TableCell>
                        </TableRow>

                        {
                            props.dataset.author &&
                            <TableRow>
                                <TableCell>
                                    <b> Source </b>
                                </TableCell>
                                <TableCell sx={{ textAlign: "left" }}>
                                    {props.dataset.author}
                                </TableCell>
                            </TableRow>
                        }

                        {
                            props.dataset.date_collected &&
                            <TableRow>
                                <TableCell>
                                    <b> Date Collected: </b>
                                </TableCell>
                                <TableCell sx={{ textAlign: "left" }}>
                                    {new Date(props.dataset.date_collected).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        }

                        {
                            props.dataset.license &&
                            <TableRow>
                                <TableCell>
                                    <b> License: </b>
                                </TableCell>
                                <TableCell sx={{ textAlign: "left" }}>
                                    {props.dataset.license}
                                </TableCell>
                            </TableRow>
                        }

                        <TableRow>
                            <TableCell>
                                <b> Views </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.dataset.clicks}
                            </TableCell>

                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Bookmarks </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.dataset.likes}
                            </TableCell>

                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Unprocessed Updates </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.dataset.unprocessed_updates}
                            </TableCell>

                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Tags </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <div class="row">
                                    {props.dataset.tags.map((tag, index) => {
                                        if (index < 5) {
                                            return <span class="col"
                                                key={index} >
                                                {tag}
                                            </span>
                                        }
                                    })}
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '2em'
                    }}>

                </Box>
            </Box>
        </Modal>
    </>
}