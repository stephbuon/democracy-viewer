
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Popularize } from '../apiFolder/DatasetSearchAPI';

export const Result = (props) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const navigate = useNavigate();

    const chooseDataset = () => {
        Popularize(props.result)
        props.setDataset(props.result);
    }

    useEffect(() => {
        // console.log(result)

    }, []);

    return <div>

        <Box onClick={() => handleOpen()}>
            {props.result.title}
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
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{

                                }}>
                                {props.result.title}
                            </TableCell>
                            <TableCell>
                                &nbsp;
                            </TableCell>
                            <TableCell>
                                {props.result.is_public && "Public"}
                                {!props.result.is_public && "Private"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Owner:
                            </TableCell>
                            <TableCell>
                                {props.result.username}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                Description:
                            </TableCell>
                            <TableCell>
                                {props.result.description}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Tags:
                            </TableCell>
                            {props.result.tags.map((tag, index) => {
                                if (index < 5) {
                                    return <TableCell key={index}>
                                        {tag}
                                    </TableCell>
                                }
                            })}
                            {props.result.tags.length < 1 && <TableCell key={1} />}
                            {props.result.tags.length < 2 && <TableCell key={2} />}
                            {props.result.tags.length < 3 && <TableCell key={3} />}
                            {props.result.tags.length < 4 && <TableCell key={4} />}
                            {props.result.tags.length < 5 && <TableCell key={5} />}
                            {props.result.tags.length < 6 && <TableCell key={6} />}
                            {props.result.tags.length > 5 && <TableCell key={'...'}>
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
                        marginTop: '2em'
                    }}>
                    <Button
                        variant="contained"
                        primary
                        sx={{

                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/subsetSearch');
                        }}
                    >
                        Use Dataset
                    </Button>
                </Box>

            </Box>
        </Modal>

    </div>
}