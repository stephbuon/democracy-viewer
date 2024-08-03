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
import { GetCSVFromAPI, CreateDataset } from "../apiFolder/DatasetUploadAPI.js";
import { useNavigate } from "react-router-dom";

export const Upload = (props) => {
  const navigate = useNavigate();

  const [file, setFile] = useState(undefined);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [headers, setheaders] = useState([]);
  const [tableName, settableName] = useState(undefined);
  const [APIEndpoint, setAPIEndpoint] = useState("");
  const [Token, setToken] = useState("");
  const [clicked, setClicked] = useState(undefined);
  const [alert, setAlert] = useState(0);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [disableButtons, setDisableButtons] = useState(false);

  const openDataSetInfo = () => {
    setFileLoaded(true);
  };
  const handleDataSetInfo = () => {
    setFileLoaded(false);
  };
  const CancelUpload = () => {
    setFileLoaded(false);
  };

  const handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarOpen(false);
  };

  useEffect(() => {
    if (file && file.name) {
      const validExtensions = [".csv", ".xls", ".xlsx"];
      if (validExtensions.filter((x) => file.name.includes(x)).length === 0) {
        setAlert(1);
      } else {
        uploadCsv();
      }
    } else {
      setFileLoaded(false);
    }
  }, [file]);

  const uploadCsv = () => {
    setUploadProgress(0);
    setDisableButtons(true);
    CreateDataset(file, setUploadProgress).then(res => {
      settableName(res.table_name)
      setheaders([...Object.keys(res.data[0])])
      setFileUploaded(true);
      setAlert(3);
    }).catch(() => {
      setAlert(2);
      setFile(undefined);
      setUploadProgress(0);
    }).finally(() => setDisableButtons(false));
  };

  const APIcsv = () => {
    setDisableButtons(true);
    GetCSVFromAPI(APIEndpoint, Token)
      .then((res) => {
        settableName(res.table_name);
        setheaders([...Object.keys(res.data[0])]);
        setFileUploaded(true);
        setAlert(3);
      })
      .catch(() => {
        setAlert(2);
      }).finally(() => setDisableButtons(false));
  };

  const click = (a) => {
    setClicked(a);
  };

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

  useEffect(() => {
    if (alert !== 0) {
      setSnackBarOpen(true);
    } else {
      setSnackBarOpen(false);
    }
  }, [alert]);

  return (
    <>
      <Container maxWidth="sm">
        <Typography
          paddingTop={5}
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Upload
        </Typography>

        <Stack sx={{ pt: 4 }} direction="row" spacing={2} justifyContent="center"></Stack>
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => handleSnackBarClose()}
      >
        <Alert
          onClose={handleSnackBarClose}
          severity={alert === 3 ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {alert === 1 && <div>Only '.csv', '.xls', and '.xlsx' files can be uploaded</div>}
          {alert === 2 && <div>An error occurred uploading the dataset</div>}
          {alert === 3 && <div>Dataset successfully uploaded</div>}
        </Alert>
      </Snackbar>
      <Modal open={fileLoaded} onClose={() => handleDataSetInfo()}>
        <div>
          {(clicked == 1 || clicked === 2) && (
            <UploadModal CancelUpload={() => CancelUpload()} name={tableName} headers={headers} />
          )}
        </div>
      </Modal>
      <Container maxWidth="md">
        <Grid container spacing={4} justifyContent="space-between">
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
                <Typography align="center">Upload a CSV or Excel File</Typography>
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
                    accept="*/*"
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
        </Grid>
      </Container>
    </>
  );
};
