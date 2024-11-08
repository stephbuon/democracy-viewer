import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  TextField,
  Stack,
  Snackbar,
  Alert,
  Paper,
  Modal
} from "@mui/material";
import { GroupTable } from '../common/tables/GroupTable';

const pageLength = 5;

export const Groups = (props) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "join" or "create"
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [group, setGroup] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [totalNumResults, setTotalNumResults] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const handleOpen = (type) => {
        setModalType(type);
        setModalOpen(true);
    };

    const handleClose = () => {
        setModalOpen(false);
        setGroupName("");
        setInviteEmail("");
    };

    const handleJoinGroup = () => {
        console.log("Joining group with email invite:", inviteEmail);
        handleClose();
    };

    const handleCreateGroup = () => {
        console.log("Creating group with name:", groupName);
        handleClose();
    };

    const GetNewPage = async (selectedPage) => {
        setLoadingResults(true);
        // Fetch groups logic here
        setLoadingResults(false);
    };

    const onEnter = () => {
        //run a backend filter
    }

    return (
        <div className = 'blue' style={{ marginTop: "-1in", overflow: 'hidden' }}>
            <Grid container sx={{ height: '100vh' }}>
                {/* Left side: Title and Buttons */}
                <Grid item xs={12} sm={5} component={Paper} elevation={6} square sx={{ p: 5 }}>
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
                            <Typography variant="h4" gutterBottom>
                                Groups
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Focus in and Join Your Community
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

                        {/* Buttons for Create and Join Group */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => handleOpen("create")}
                                sx={{ mb: 2 }}
                            >
                                Create Group
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => handleOpen("join")}
                                sx={{ mb: 2 }}
                            >
                                Join Group
                            </Button>
                        </Box>
                    </Stack>
                </Grid>

                {/* Right side: Groups List */}
                <Grid item xs={12} sm={7} sx={{ backgroundColor: '#f4f6f8', p: 5 }}>
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
                                label="Invite Email"
                                variant="outlined"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
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
