import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Modal,
  Typography,
  TextField,
  Stack
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { GetGroups } from '../apiFolder/GroupAPI';

//added a passcode input for a 6 digit access code to be put in when joining a group

const theme = createTheme();

export default function Groups() {
const navigate = useNavigate();

export const Groups = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "join" or "create"
  const [groupName, setGroupName] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const handleOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setGroupName("");
    setAccessCode("");
  };

  const handleJoinGroup = () => {
    console.log("Joining group with access code:", accessCode);
    // Add logic for joining a group with the access code
    handleClose();
  };

  const handleCreateGroup = () => {
    console.log("Creating group with name:", groupName);
    // Add logic for creating a group with the given name
    handleClose();
  };

  return (
    <Container maxWidth="sm">
      <Typography
          paddingTop={5}
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Groups
        </Typography>

      <Stack sx={{ pt: 4 }} direction="row" spacing={2} justifyContent="center"></Stack>
      <Grid container spacing={4}>
        {/* Create Group Card */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">
                Create Group
              </Typography>
              <Typography variant="body2" align="center">
                Start a new group by providing a group name.
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen("create")}
              >
                Create Group
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Join Group Card */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">
                Join Group
              </Typography>
              <Typography variant="body2" align="center">
                Enter an access code to join an existing group.
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleOpen("join")}
              >
                Join Group
              </Button>
            </CardActions>
          </Card>
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
              />
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
                <Button variant="contained" onClick={handleJoinGroup}>
                  Join
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};
}

