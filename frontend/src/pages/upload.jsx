import { React, useState, useEffect } from "react";
import { upload } from "../api/api.js";

import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

import { UploadModal } from './UploadModal';
import { Table, TableBody, TableRow, TableCell, TextField } from '@mui/material';
import { GetCSVFromAPI, CreateDataset } from "../apiFolder/DatasetUploadAPI.js";
import { useNavigate } from "react-router-dom";

export const Upload = (props) => {
  const [file, setFile] = useState(undefined);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [headers, setheaders] = useState([]);
  const [tableName, settableName] = useState(undefined);
  const [APIEndpoint, setAPIEndpoint] = useState("");
  const [Token, setToken] = useState("");
  const [clicked, setClicked] = useState(undefined);
  const [alert, setAlert] = useState(true);
  const [fileUploaded, setFileUploaded] = useState(false);

  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const openDataSetInfo = () => {
    setFileLoaded(true);
  }
  const handleDataSetInfo = () => {
    setFileLoaded(false);
  }
  const CancelUpload = () => {
    setFileLoaded(false);
  }

  const openSnackbar = () => {
    setSnackBarOpen(true)
  }
  const handleSnackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  useEffect(() => {
    if (file && file.name) {
      const validExtensions = [".csv", ".xls", ".xlsx"];
      if (validExtensions.filter((x, i) => file.name.includes(x)).length === 0) {
        setAlert(true)
        openSnackbar()
      }
      else {
        uploadCsv();
      }
    }
    else {
      setFileLoaded(false);
    }
  }, [file]);

  const uploadCsv = () => {
    CreateDataset(file).then(res => {
      settableName(res.table_name)
      setheaders([...Object.keys(res.data[0])])
      setFileUploaded(true);
    }).catch(() => {
      setAlert(false)
      openSnackbar()
    }).finally(() => {
      setFile(undefined);
    })
  }

  const APIcsv = () => {
    GetCSVFromAPI(APIEndpoint, Token).then(res => {
      settableName(res.table_name)
      setheaders([...Object.keys(res.data[0])])
      setFileUploaded(true);
    }).catch(() => {
      setAlert(false)
      openSnackbar()
    })
  }

  const click = (a) => {
    setClicked(a)
  }

  const loggedIn = () => {
    if(props.currUser)
    {
      return true;
    }
    return false;
  }
  const navigate = useNavigate();
  useEffect(() => {
    if(!loggedIn())
    {
      props.setNavigated(true)
      navigate('/login');
    }
  }, []);

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

        <Stack
          sx={{ pt: 4 }}
          direction="row"
          spacing={2}
          justifyContent="center"
        >
        </Stack>
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => handleSnackBarClose()}
      >
        <Alert onClose={handleSnackBarClose} severity="error" sx={{ width: '100%' }}>
          {alert && <div>Only '.csv', '.xls', and '.xlsx' files can be uploaded</div>}
          {!alert && <div>API connection is bad</div>}
        </Alert>
      </Snackbar>
      <Modal
        open={fileLoaded}
        onClose={() => handleDataSetInfo()}
      >
        <div>
          {(clicked == 1 || clicked === 2) && <UploadModal
            CancelUpload={() => CancelUpload()}
            name={tableName}
            headers={headers}
          />}
        </div>
      </Modal>
      <Container maxWidth="md">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={13} sm={7} md={5}>
            <Card
              sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                  Local file
                </Typography>
                <Typography align='center'>
                  Upload a CSV or Excel File
                </Typography>
              </CardContent>
              <CardActions style={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 5, bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 }}
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
            <Card
              sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                  API
                </Typography>
                <Typography align='center'>
                  Upload From an API Endpoint
                </Typography>
              </CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className='col-6'
                      sx={[
                        clicked == 2 && {
                          background: 'grey',
                        }
                      ]}
                      onClick={() => click(2)}
                    >
                      <TextField
                        margin="normal"
                        fullWidth
                        label="API Endpoint"
                        value={APIEndpoint}
                        onChange={event => { setAPIEndpoint(event.target.value) }}
                      />
                      <TextField
                        margin="normal"
                        fullWidth
                        label="Token"
                        value={Token}
                        onChange={event => { setToken(event.target.value) }}
                      />
                      <center></center>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <CardActions style={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 5, bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 }}
                  onClick={() => APIcsv()}
                >
                  Get csv
                </Button>
              </CardActions>
            </Card>
            <Box sx={{ position: 'absolute', top: -25, right: 0 }}>
              {fileUploaded && 
              <Button
                variant="contained"
                sx={{ bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 }}
                onClick={() => { setFileLoaded(true); setFileUploaded(false) }}
              >
                Continue
              </Button>}
              {!fileUploaded && <Button
                variant="contained"
                disabled
                sx={{ bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1 }}
              >
                Continue
              </Button>}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
