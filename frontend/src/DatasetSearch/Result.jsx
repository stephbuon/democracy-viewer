
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

    return <div id={result.result.datasetName}>

        <Box onClick={() => handleOpen()}
            sx={{
                background: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)'
            }}>
            {result.result.datasetName}
        </Box>
        <Modal
            open={open}
            onClose={() => handleClose()}
        // aria-labelledby="modal-modal-title"
        // aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    background: 'rgb(255, 255, 255)',
                    color: 'rgb(0, 0, 0)'
                }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{

                                }}>
                                {result.result.datasetName}
                            </TableCell>
                            <TableCell>
                                &nbsp;
                            </TableCell>
                            <TableCell>
                                {result.result.public && "Public"}
                                {!result.result.public && "Private"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Owner:
                            </TableCell>
                            <TableCell>
                                {result.result.owner}
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