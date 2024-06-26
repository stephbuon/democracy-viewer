// MUI Imports
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const DatasetInformation = (props) => {
    return <>
        <Box sx={{ padding: 0 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Dataset Information
                <Tooltip title="Provide general information about the dataset. Noticed that the information will be shared to public if you select 'public' for privacy.">
                    <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                <TextField
                    id="Title"
                    label="Title"
                    variant="filled"
                    fullWidth
                    sx={{ background: 'rgb(255, 255, 255)' }}
                    value={props.title}
                    onChange={event => { props.setTitle(event.target.value); }}
                />
                <TextField
                    id="Author"
                    label="Author"
                    variant="filled"
                    fullWidth
                    sx={{ background: 'rgb(255, 255, 255)' }}
                    value={props.author}
                    onChange={event => { props.setAuthor(event.target.value); }}
                />
                <TextField
                    id="Date"
                    label="Date"
                    type="date"
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ background: 'rgb(255, 255, 255)' }}
                    value={props.date}
                    onChange={event => { props.setDate(event.target.value); }}
                />
                <TextField
                    id="Description"
                    label="Description"
                    variant="filled"
                    fullWidth
                    sx={{ background: 'rgb(255, 255, 255)' }}
                    value={props.description}
                    onChange={event => { props.setDescription(event.target.value); }}
                />
                <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                    <InputLabel>Privacy</InputLabel>
                    <Select
                        value={props.publicPrivate}
                        onChange={event => props.setPublicPrivate(event.target.value)}
                    >
                        <MenuItem value={true}>Public</MenuItem>
                        <MenuItem value={false}>Private</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Box>
    </>
}