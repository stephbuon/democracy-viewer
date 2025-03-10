import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Modal
} from "@mui/material";
import { GroupTable } from '../common/tables';
import { filterGroups } from "../../api";
import { useNavigate } from "react-router-dom";

const pageLength = 5;

export const Groups = (props) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "join" or "create"
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [group, setGroup] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [totalNumResults, setTotalNumResults] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    const handleOpen = (type, group) => {
        setModalType(type);
        if (type === "join") setGroup(group); // Set the selected group for joining
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setGroupName("");
    };

    const handleJoinGroup = () => {
        console.log("Joining group with access code:", accessCode);
        handleClose();
    };

    const handleCreateGroup = () => {
        console.log("Creating group with name:", groupName);
        handleClose();
        navigate("/group-home", {state: {groupName, groupDescription}})
    };

    const GetNewPage = async (selectedPage) => {
        setLoadingResults(true);
        // Fetch groups logic here
        try {
            // Implement your group fetching logic here
            const response = await filterGroups({ searchTerm }, selectedPage);
            setSearchResults(response.results || []);
            setTotalNumResults(response.total || 0);
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoadingResults(false);
        }
    };

    const onEnter = (event) => {
        //run a backend filter
        if (event.key === "Enter") {
            //filterGroups({ searchTerm }, 1);
            GetNewPage(1);
        }
    }

    return (
        <div className = 'blue' style={{ marginTop: "-1in", overflow: 'hidden' }}>
            <Grid container sx={{ height: '100vh' }}>
                {/* Left side: Title and Buttons */}
                <Grid item xs={12} sm={5} component={Paper} elevation={6} square sx={{ backgroundColor:  'white', p: 5 }}>
                    <Stack spacing={2}>
                    <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                mb: 4,
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 1 }} paddingTop={20} paddingInline={5} fontSize={40}>
                                Groups
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 3 }} paddingTop={10} paddingInLine={10}>
                                Focus In and Join Your Community
                            </Typography>
                        </Box>
                        <Box>
                            <div align="center">
                                <TextField
                                    sx={{ width: "400px" }}
                                    id="searchTerm"
                                    label="Search"
                                    variant="outlined"
                                    color="primary"
                                    focused
                                    value={searchTerm}
                                    onChange={event => { setSearchTerm(event.target.value) }}
                                    onKeyDown = {onEnter}
                                />        
                            </div>                        
                        </Box>

                        {/* Buttons for Create Group */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                width= '200px'
                                onClick={() => handleOpen("create")}
                                sx={{ mb: 2 }}
                            >
                                Create Group
                            </Button>
                            <br />
                        </Box>
                    </Stack>
                </Grid>

                {/* Right side: Groups List */}
                <Grid item xs={12} sm={7} sx={{ backgroundColor: '#99ccff', p: 5 }}>
                    <Typography variant="h5" align="center" sx={{ mb: 3 }}>
                        Current Groups & Pending Invites
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <GroupTable
                            searchResults={searchResults}
                            loadingResults={loadingResults}
                            // setGroup={props.setGroup}
                            GetNewPage={GetNewPage}
                            editable={false}
                            pageLength={pageLength}
                            totalNumResults={totalNumResults}
                            // deleteCallBack={deleteCallBack}
                            onJoinGroup={(group) => handleOpen("join", group)} // New prop for handling join action
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Modal for Join/Create Group */}
            <Modal open={modalOpen} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    {modalType === "create" ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Create Group
                            </Typography>
                            <TextField
                                fullWidth
                                label="Group Name"
                                variant="outlined"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Group Description"
                                variant="outlined"
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                            />
                            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                                <Button variant="contained" onClick={handleCreateGroup}>
                                    Create
                                </Button>
                                <Button variant="outlined" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Join Group
                            </Typography>
                            <TextField
                                fullWidth
                                label="Access Code"
                                variant="outlined"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                                <Button variant="contained" onClick={handleJoinGroup}>
                                    Request
                                </Button>
                                <Button variant="outlined" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </Stack>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Snackbar for notifications */}
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackBarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackBarOpen(false)}
            >
                <Alert severity="info">You must be logged in to see groups.</Alert>
            </Snackbar>
        </div>
    );
};