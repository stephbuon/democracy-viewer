
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

export const Result = (result) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    useEffect(() => {
        // console.log(result)

    }, []);

    return <div>

        <Box onClick={() => handleOpen()}
            sx={{
                background: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)'
            }}>
            {result.result.title}
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
                <Table
                sx={{
                    margin: "1em"
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{

                                }}>
                                {result.result.title}
                            </TableCell>
                            <TableCell>
                                &nbsp;
                            </TableCell>
                            <TableCell>
                                {result.result.is_public && "Public"}
                                {!result.result.is_public && "Private"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Owner:
                            </TableCell>
                            <TableCell>
                                {result.result.username}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                Tags:
                            </TableCell>
                            {result.result.tags.map((tag, index) => {
                                {
                                    if (index < 5) {
                                        return <TableCell key={index}>
                                            {tag}
                                        </TableCell>
                                    }
                                }
                            })}
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                Description:
                            </TableCell>
                            <TableCell>
                                {result.result.description}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </Modal>

    </div>
}