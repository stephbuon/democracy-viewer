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


export const GroupResultModal = (props) => {
    const navigate = useNavigate();

    const [userName, setUserName] = useState(undefined);
    const [groupId, setGroupId] = useState(props.groups.setGroupId);

    const handleClose = () => props.setOpen(false);

    const chooseGroup = () => {
        props.setGroup(props.group);
    }

    const leaveGroup = () => {
        props.setGroup(props.group);
    }

    return <>
        <Modal
            open={props.open}
            onClose={() => handleClose()}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '15%',
                    height: "60%",
                    overflow: "scroll",
                    width: "70%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em",
                    paddingBottom: "15px"
                }}
            >
                <Table sx={{ border: 'none' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    paddingTop: "20px",
                                    align: 'center'

                                }}>
                                <b>{props.group.title}</b>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <b> Owner </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                <Link to={`/profile/${props.group.email}`}>
                                    {
                                        userName !== undefined && userName
                                    }

                                    {
                                        userName === undefined && props.group.email
                                    }
                                </Link>
                            </TableCell>

                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <b> Description </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.group.description}
                            </TableCell>
                        </TableRow>


                        <TableRow>
                            <TableCell>
                                <b> Member Count </b>
                            </TableCell>
                            <TableCell sx={{ textAlign: "left" }}>
                                {props.group.clicks}
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
                                chooseGroup()
                                navigate(`/groups/${ groupId }/home`); //going to specific group home
                            }}
                        >
                            Visit Group
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
                                leaveGroup();
                            }}
                        >
                            Leave Group
                        </Button>
                </Box>
            </Box>
        </Modal>
    </>
}