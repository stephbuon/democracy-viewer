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
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';


import { UploadModal } from './UploadModal';
import { Table, TableBody, TableHead, FormControl, MenuItem, Select, InputLabel, TableRow, TableCell, Paper, TextField } from '@mui/material';
import { GetCSVFromAPI } from "../apiFolder/DatasetUploadAPI.js";

// import fs from 'fs';

export const Upload = (props) => {
  const [file, setFile] = useState(undefined);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [passFile, setPassFile] = useState(undefined);
  const [fileHeaders, setFileHeaders] = useState(undefined);
  const [apiHeaders, setApiHeaders] = useState([]);
  const [apiTableName, setApiTableName] = useState(undefined);
  const [APIEndpoint, setAPIEndpoint] = useState("");
  const [Token, setToken] = useState("");
  const [clicked, setClicked] = useState(undefined);
  const [alert, setAlert] = useState(true);



  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const readCSV = (path) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const text = e.target.result;
      console.log(text);
      processCSV(text)
    }

    reader.readAsText(file);
  })

  const processCSV = (str, delim = ',') => {
    setFileHeaders(str.slice(0, str.indexOf('\n')).split(delim));
  }


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
    file && console.log(file);

    // console.log('hello',file == undefined)
    if (file != undefined) {
      console.log(file)
      if (file.name.search('.csv') === -1) {
        setAlert(true)
        openSnackbar()
      }
      else {
        readCSV(file)
        setPassFile(file);
        console.log(fileHeaders)
      }
    }
    else {
      setFileLoaded(false);
    }
  }, [file]);

  const APIcsv = () => {
    GetCSVFromAPI(APIEndpoint, Token).then(res => {
      setApiTableName(res.table_name)
      setApiHeaders([...Object.keys(res.data[0])])
    }).catch(() => {
      setAlert(false)
      openSnackbar()
    })
  }

  const click = (a) => {
    console.log('clicked =', clicked)
    setClicked(a)
  }

  const ready = () => {
    if (clicked == 1) {
      if (passFile) { return true }
    }
    else if (clicked == 2) {
      if (apiHeaders.length > 0) { return true }
    }
    else { return false }
  }
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
          {alert && <div>Only '.csv' files can be uploaded</div>}
          {!alert && <div>API connection is bad</div>}
        </Alert>
      </Snackbar>
      <Modal
        open={fileLoaded}
        onClose={() => handleDataSetInfo()}
      >
        <div>
          {clicked == 1 && <UploadModal
            // advancedFilterResults={(x) => advancedFilterResults(x)}
            CancelUpload={() => CancelUpload()}
            file={passFile}
            headers={fileHeaders}
          />}

          {clicked == 2 && <UploadModal
            // advancedFilterResults={(x) => advancedFilterResults(x)}
            CancelUpload={() => CancelUpload()}
            file={passFile}
            useAPI={true}
            apidatasetname={apiTableName}
            headers={apiHeaders}
          />}
        </div>
      </Modal>
//Added
      <Container maxWidth="md">

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                  Select File
                </Typography>
                <Typography align='center'>
                  Select and Upload File
                </Typography>

              </CardContent>
              <CardActions style={{ justifyContent: 'center' }}>
                <input
                  accept="*/*" // If you want to limit to image files, otherwise omit
                  style={{ display: 'none' }}
                  id="file_input"
                  type="file"
                  onChange={(x) => {
                    setFile(x.target.files[0]);
                    setPassFile(x.target.files[0]);
                  }}
                />
                <label htmlFor="file_input" style={{marginBottom: '50px'}}>
                  <img
                    src="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_1280.png" // Replace with your image URL
                    alt="Choose File"
                    style={{
                      cursor: 'pointer', // Change the cursor to indicate it's clickable
                      width: '150px', // Set the width as needed
                      height: '150px', // Set the height as needed
                    }}
                  />
                </label>
              </CardActions>
            </Card>

          </Grid>


          <Grid item xs={12} sm={6} md={8}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                sx={{
                  // 16:9
                  height: 200,
                  width: '100%'
                }}
                image="https://media.istockphoto.com/id/1144573725/photo/financial-business-charts-graphs-and-diagrams-3d-illustration-render.jpg?s=612x612&w=0&k=20&c=s4IjGwWu7k1c8r-V5Gzt7LGVnMHTnOexTlSm_j_MafY="
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" align='center'>
                  API
                </Typography>
                <Typography align='center'>
                  Use an api endpoint to upload
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
                      onClick={() => click(2)}>

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
                  onClick={() => APIcsv()}
                >
                  Get csv
                </Button>
              </CardActions>
            </Card>

          </Grid>
        </Grid>
      </Container>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <center>

                {ready() && <Button
                  onClick={() => { setFileLoaded(true) }}
                >
                  Continue
                </Button>}
                {!ready() && <Button
                  disabled
                >
                  Continue
                </Button>}
              </center>

            </TableCell>
          </TableRow>
        </TableBody>
      </Table>


    </>
  );
};
