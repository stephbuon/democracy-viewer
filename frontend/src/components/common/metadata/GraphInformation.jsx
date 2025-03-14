// MUI Imports
import { Box, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FormattedTextField } from "../forms";

export const GraphInformation = (props) => {
    const setValid = (val) => {
        if (!props.disabled) {
            if (!val) {
            props.setDisabled(true);
            }
        } else if (val) {
            const errors = document.querySelectorAll("p.Mui-error");
            if (errors.length === 0) {
                props.setDisabled(false);
            }
        }
    }

    return <Box sx={{ padding: 0 }}>
        <Typography variant="h5" align="center" gutterBottom>
            Graph Information
            <Tooltip title="Provide general information about the graph. Noticed that the information will be shared to public if you select 'public' for privacy.">
                <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
            <FormattedTextField
                id="Title"
                label="Title"
                variant="filled"
                fullWidth
                sx={{ background: 'rgb(255, 255, 255)' }}
                defaultValue={props.title}
                setValue={props.setTitle}
                maxChars={100}
                required
                setValid={setValid}
            />
            <FormattedTextField
                id="Description"
                label="Description"
                variant="filled"
                fullWidth
                sx={{ background: 'rgb(255, 255, 255)' }}
                defaultValue={props.description}
                setValue={props.setDescription}
                maxChars={500}
                required
                setValid={setValid}
            />
            <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                <InputLabel>Privacy</InputLabel>
                <Select
                    value={props.publicPrivate}
                    onChange={event => props.setPublicPrivate(event.target.value)}
                >
                    <MenuItem value={1}>Public</MenuItem>
                    <MenuItem value={0}>Private</MenuItem>
                </Select>
            </FormControl>
        </Box>
    </Box>
}