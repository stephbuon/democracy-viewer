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
import { reprocessDataset, getUser, deleteDataset, addLike, deleteLike, UpdateMetadata, AddTags, DeleteTag, Popularize } from '../../../api';

export const GraphResultModal = (props) => {
    const navigate = useNavigate();

    const handleClose = () => props.setOpen(false);

    const [userName, setUserName] = useState(undefined);

    useEffect(() => {
        if (props.open && !userName) {
            getUser(props.graph.email).then(user => setUserName(`${user.first_name} ${user.last_name}`));
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
                        props.loggedIn && props.graph.liked === false &&
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
                            onClick={() => {}}>
                            Bookmark
                        </Button>
                    }

                    {
                        props.loggedIn && props.graph.liked === true &&
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
                            onClick={() => {}}>
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
                            onClick={() => {
                                navigate('/graph');
                            }}
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
                                <b>{props.graph.title}</b>
                            </TableCell>
                            <TableCell
                                sx={{
                                    textAlign: "left",
                                    paddingTop: "40px"
                                }}>
                                {props.graph.is_public == 1 && <span>Public</span>}
                                {props.graph.is_public == 0 && <span>Private</span>}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <b> Author </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <Link to={`/profile/${props.graph.email}`}>
                                    {
                                        userName !== undefined && userName
                                    }

                                    {
                                        userName === undefined && props.graph.email
                                    }
                                </Link>
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <b> Description </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.graph.description}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Views </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.graph.clicks}
                            </TableCell>

                        </TableRow>

                        <TableRow>
                            <TableCell>
                                <b> Bookmarks </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.graph.likes}
                            </TableCell>

                        </TableRow>

                        {/* <TableRow>
                            <TableCell>
                                <b> Tags </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <div class="row">
                                    {props.graph.tags.map((tag, index) => {
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