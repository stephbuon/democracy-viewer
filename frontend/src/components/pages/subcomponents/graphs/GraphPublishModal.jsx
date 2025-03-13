// MUI Imports
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FormattedTextField } from "../../../common/forms";
import { useState } from 'react';
import { publishGraph, uploadGraphMetadata } from '../../../../api';
import Plotly from "plotly.js-dist";

export const GraphPublishModal = (props) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [publicPrivate, setPublicPrivate] = useState(false);

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

    const submitGraph = async() => {
        props.setDisabled(true);
        try {
            const graphURL = await Plotly.toImage("graph");
            const response = await fetch(graphURL);
            const graph = await response.blob();
            const settings = JSON.parse(localStorage.getItem('graph-settings'));
            settings.group_list = settings.group_list.sort();
            settings.pos_list = settings.pos_list.sort();
            settings.word_list = settings.word_list.sort();
            const s3_id = await publishGraph({ settings }, graph);
            await uploadGraphMetadata({
                s3_id, title, description, is_public: publicPrivate, table_name: settings.table_name
            });
            props.handleClose();
            props.setAlert(2);
        } catch {
            props.setDisabled(false);
        }
        
    }

    return <>
        <Box
            sx={{
                position: 'absolute',
                top: '5%',
                left: '15%',
                height: "90%",
                overflowY: "auto",
                width: "70%",
                bgcolor: 'background.paper',
                border: '1px solid #000',
                borderRadius: ".5em .5em",
                boxShadow: 24,
                p: 4,
                outline: 'none'
            }}
        >
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
                    <FormattedTextField
                        id="Title"
                        label="Title"
                        variant="filled"
                        fullWidth
                        sx={{ background: 'rgb(255, 255, 255)' }}
                        defaultValue={title}
                        setValue={setTitle}
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
                        defaultValue={description}
                        setValue={setDescription}
                        maxChars={500}
                        required
                        setValid={setValid}
                    />
                    <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                        <InputLabel>Privacy</InputLabel>
                        <Select
                            value={publicPrivate}
                            onChange={event => setPublicPrivate(event.target.value)}
                        >
                            <MenuItem value={true}>Public</MenuItem>
                            <MenuItem value={false}>Private</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                <Button
                    variant="contained"
                    sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                    onClick={() => props.handleClose()}
                >
                    Cancel
                </Button>
                
                <Button
                    variant="contained"
                    sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                    disabled={props.disabled}
                    onClick={() => submitGraph()}
                >
                    Submit Graph
                </Button>
            </Box>
        </Box>
    </>
}
