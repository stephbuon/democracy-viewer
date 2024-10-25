import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Modal,
  Snackbar,
  Stack,
  Typography,
  LinearProgress,
} from "@mui/material";

import { UploadModal } from "./UploadModal";
import { Table, TableBody, TableRow, TableCell, TextField } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { SelectField } from "../common/selectField";

export const Upload = (props) => {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [uploadModeSelected, setUploadModeSelected] = useState(undefined);

  const CancelUpload = () => {
    setOpenModal(false);
  };

  const OpenModal = (mode) => {
    setUploadModeSelected(mode);
    setOpenModal(true);
  }

  const loggedIn = () => {
    if (props.currUser) {
      return true;
    } else {
      const demoV = JSON.parse(localStorage.getItem("democracy-viewer"));
      if (demoV && demoV.user) {
        return true;
      } else {
        return false;
      }
    }
  };

  useEffect(() => {
    if (!loggedIn()) {
      props.setNavigated(true);
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Modal open={openModal} onClose={() => CancelUpload()}>
        <div>
            <UploadModal CancelUpload={() => CancelUpload()} uploadType={uploadModeSelected} />
        </div>
      </Modal>
      <Container maxWidth="md">
        <Typography
          paddingTop={7}
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Upload
        </Typography>
      </Container>

      <Container maxWidth="md">
        <Typography
          paddingTop={3}
          component="p"
          variant="p"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Upload either a CSV file or an API of your text-based dataset to use it on Democracy Viewer. 
        </Typography>
      </Container>
      
      <Container maxWidth="md" sx={{
        display: "flex",
        justifyContent: "space-evenly",
        marginTop: "30px"
      }}>
          <Button
              variant="contained"
              sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center', width: "150px" }}
              onClick={() => OpenModal("csv")}
          >
              CSV File
          </Button>
          <Button
              variant="contained"
              sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center', width: "150px" }} 
              onClick={() => OpenModal("api")}
          >
              API
          </Button>
        {/* <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={13} sm={7} md={5}>
            <Card sx={{ height: "90%", display: "flex", flexDirection: "column" }}>
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  Upload File
                </Typography>
                <Typography align="center">Upload a CSV File</Typography>
                {uploadProgress > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                    sx={{ width: "100%", mt: 2 }}
                  />
                )}
              </CardContent>
              <CardActions style={{ justifyContent: "center" }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 5, bgcolor: "black", color: "white", borderRadius: "50px", px: 4, py: 1 }}
                  disabled={disableButtons}
                >
                  Select
                  <input
                    type="file"
                    
                    hidden
                    onChange={(x) => {
                      setFile(x.target.files[0]);
                      click(1); // This explicitly sets clicked to 1, indicating a file upload action
                    }}
                  />
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={15} sm={9} md={7} position="relative">
            <Card sx={{ height: "90%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  API
                </Typography>
                <Typography align="center">Upload From an API Endpoint</Typography>
              </CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="col-6">
                      <TextField
                        margin="normal"
                        fullWidth
                        label="API Endpoint"
                        value={APIEndpoint}
                        onChange={(event) => {
                          setAPIEndpoint(event.target.value);
                        }}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Token"
                        value={Token}
                        onChange={(event) => {
                          setToken(event.target.value);
                        }}
                      />
                      <center></center>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <CardActions style={{ justifyContent: "center" }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 5, bgcolor: "black", color: "white", borderRadius: "50px", px: 4, py: 1 }}
                  onClick={() => APIcsv()}
                  disabled={disableButtons}
                >
                  Call API
                </Button>
              </CardActions>
            </Card>
            <Box sx={{ position: "absolute", top: -25, right: 0 }}>
              <Button
                variant="contained"
                sx={{ bgcolor: "black", color: "white", borderRadius: "50px", px: 4, py: 1 }}
                onClick={() => {
                  setFileLoaded(true);
                  setFileUploaded(false);
                }}
                disabled={!fileUploaded}
              >
                Continue
              </Button>
            </Box>
          </Grid>
        </Grid> */}
      </Container>
    </>
  );
};
