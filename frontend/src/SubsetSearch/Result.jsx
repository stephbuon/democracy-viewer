
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";

export const Result = ({ value, dataset, columnWidths }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const keys = value && typeof value === 'object' ? Object.keys(value) : [];

    return (
        <div>
            <Box onClick={handleOpen} sx={{ display: 'grid', gridTemplateColumns: columnWidths.map(width => `${width}px`).join(' ') }}>
                {keys.map((key, index) => (
                    <TableCell
                        key={index}
                        sx={{
                            maxWidth: `${columnWidths[index]}px`,
                            width: `${columnWidths[index]}px`, // Ensure this matches the header's width
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {value[key]}
                    </TableCell>
                ))}
            </Box>

            <Modal
                open={open}
                onClose={handleClose}
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
                                <TableCell>{dataset.title}</TableCell>
                                <TableCell>&nbsp;</TableCell>
                                <TableCell>&nbsp;</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {keys.map((key) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell>{value[key]}</TableCell>
                                    <TableCell>&nbsp;</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Modal>
        </div>
    );
};
