import {
    Box, Button, ButtonGroup, Modal,
    Table, TableBody, TableHead, TableRow, TableCell, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export const GroupDetailsModal = (props) => {
    const navigate = useNavigate();

return <>
    <Button
        variant="outlined"
        onClick={() => setOpenDetailsModal(true)}
    >
        View Details
    </Button>

    <Modal open={openDetailsModal} onClose={() => setOpenDetailsModal(false)}>
        <Box sx={{ ...modalStyle }}>
            <Typography variant="h6">{props.group.title}</Typography>
            <Typography><b>Owner:</b> {props.group.email}</Typography>
            <Typography><b>Description:</b> {props.group.description}</Typography>
            <Typography><b>Member Count:</b> {props.group.clicks}</Typography>
        </Box>
    </Modal>
    </>
}