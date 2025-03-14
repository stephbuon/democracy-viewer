// MUI Imports
import { Box, Button } from '@mui/material';
import { GraphInformation } from '../../../common';
import { useState } from 'react';
import { publishGraph, uploadGraphMetadata } from '../../../../api';
import Plotly from "plotly.js-dist";

export const GraphPublishModal = (props) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [publicPrivate, setPublicPrivate] = useState(false);

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
            <GraphInformation
                disabled = {props.disabled}
                setDisabled = {props.setDisabled}
                title = {title}
                setTitle = {setTitle}
                description = {description}
                setDescription = {setDescription}
                publicPrivate = {publicPrivate}
                setPublicPrivate = {setPublicPrivate}
            />

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
