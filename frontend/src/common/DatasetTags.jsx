import { useState } from "react";

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Chip from '@mui/material/Chip';

export const DatasetTags = (props) => {
    const [tag, setTag] = useState('');

    const addTag = () => {
        if (tag.trim() === "") return;
        let _tags = [...props.tags];
        _tags.push(tag);
        props.setTags(_tags);
        setTag('');
    }

    const deleteTag = (_tag) => {
        let _tags = props.tags;
        let index = _tags.indexOf(_tag);
        if (index > -1) {
            _tags.splice(index, 1);
        }
        props.setTags([..._tags]);
    }

    return <>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Tags
                <Tooltip title="Tags are used to discover datasets.">
                    <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        id="Tag"
                        label="Tag"
                        variant="filled"
                        fullWidth
                        sx={{ background: 'rgb(255, 255, 255)' }}
                        value={tag}
                        onChange={event => { setTag(event.target.value); }}
                    />
                    <IconButton onClick={() => addTag()}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {props.tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            onDelete={() => deleteTag(tag)}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    </>
}