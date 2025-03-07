import {
    Box, Button, ButtonGroup, Modal,
    Table, TableBody, TableHead, TableRow, TableCell, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { AlertDialog } from '../AlertDialog';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { Link } from 'react-router-dom';
import { getUser, getGraphImageUrl, getMetadata, bookmarkGraph, unbookmarkGraph } from '../../../api';

export const GraphResultModal = (props) => {
    const navigate = useNavigate();

    const handleClose = () => props.setOpen(false);

    const [graph, setGraph] = useState(undefined);
    const [userName, setUserName] = useState(undefined);
    const [imageUrl, setImageUrl] = useState(undefined);
    const [dataset, setDataset] = useState(undefined);

    const openGraph = () => {
        props.setDataset(dataset);
        navigate(`/graph/published/${ graph.id }`);
    }

     const like = async() => {
        await bookmarkGraph(graph.id);

        const newGraph = { ...graph, liked: true, likes: graph.likes + 1 };
        setGraph(newGraph);
    }

    const dislike = async() => {
        await unbookmarkGraph(graph.id);

        const newGraph = { ...graph, liked: false, likes: graph.likes - 1 };
        setGraph(newGraph);
    }

    useEffect(() => {
        if (props.open && !userName) {
            setGraph(props.graph);
            getUser(props.graph.email).then(user => setUserName(`${user.first_name} ${user.last_name}`));
            getGraphImageUrl(props.graph.id).then(url => setImageUrl(url));
            getMetadata(props.graph.table_name).then(meta => setDataset(meta));
        }
    }, [props.open]);

    if (!graph) {
        return <></>
    }

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
                        props.loggedIn && graph.liked === false &&
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
                        props.loggedIn && graph.liked === true &&
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
                        <Button
                            variant="contained"
                            primary
                            sx={{
                                marginX: '1em',
                                borderRadius: 50,
                                bgcolor: 'black',
                                color: 'white'
                            }}
                            onClick={() => openGraph()}
                        >
                            Visualize
                        </Button>
                </Box>

                <Table sx={{ border: 'none' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    paddingTop: "40px",
                                    align: 'center'

                                }}>
                                <b>{graph.title}</b>
                            </TableCell>
                            <TableCell
                                sx={{
                                    textAlign: "left",
                                    paddingTop: "40px"
                                }}>
                                {graph.is_public == 1 && <span>Public</span>}
                                {graph.is_public == 0 && <span>Private</span>}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <b> Dataset </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {/* <Link to={`/profile/${graph.email}`}> */}
                                    {
                                        dataset !== undefined &&
                                        <>{ dataset.title }</>
                                    }
                                {/* </Link> */}
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <b> Author </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <Link to={`/profile/${graph.email}`}>
                                    {
                                        userName !== undefined && userName
                                    }

                                    {
                                        userName === undefined && graph.email
                                    }
                                </Link>
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <b> Description </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {graph.description}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Views </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {graph.clicks}
                            </TableCell>

                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Bookmarks </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {graph.likes}
                            </TableCell>

                        </TableRow>

                        {/* <TableRow>
                            <TableCell>
                                <b> Tags </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <div class="row">
                                    {graph.tags.map((tag, index) => {
                                        if (index < 5) {
                                            return <span class="col"
                                                key={index} >
                                                {tag}
                                            </span>
                                        }
                                    })}
                                </div>
                            </TableCell>
                        </TableRow> */}
                    </TableBody>
                </Table>
                <Box
                    sx={{
                        marginTop: '2em'
                    }}
                >
                    <img src = { imageUrl }/>
                </Box>
            </Box>
        </Modal>
    </>
}