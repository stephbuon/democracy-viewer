import { React, useState, useEffect } from "react";
import { upload } from "../api/api.js";

import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';


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

        reader.onload = function(e) {
            const text = e.target.result;
            console.log(text);
            processCSV(text)
        }

        reader.readAsText(file);
  })

  const processCSV = (str, delim=',') => {
    setFileHeaders(str.slice(0,str.indexOf('\n')).split(delim));
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
    GetCSVFromAPI(APIEndpoint,Token).then(res => {
      setApiTableName(res.table_name)
      setApiHeaders([...Object.keys(res.data[0])])
    }).catch(() => {
      setAlert(false)
      openSnackbar()
    })
  }

  const click = (a) => {
    console.log('clicked =',clicked)
    setClicked(a)
  }

  const ready = () => {
    if (clicked == 1)
    {
      if(passFile) {return true}
    }
    else if (clicked == 2)
    {
      if(apiHeaders.length > 0){return true}
    }
    else{return false}
  }
  return (
    <>
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
      
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className='col-6' 
            sx={[
              clicked == 1 && {
                background: 'grey',
              }
            ]}
            onClick={() => click(1)}>
            <img src="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_1280.png" alt="Descriptive alt text" className="centered-image" style={{width: '20%', maxWidth: '100%', marginBottom: '60px'}}/>
        
      
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
      <label htmlFor="file_input">
        <Button variant="outlined" component="span"sx={{ my: 2 }}>
          Choose File
        </Button>
      </label>
      
      
            </TableCell>
            <TableCell className='col-6' 
            sx={[
              clicked == 2 && {
                background: 'grey',
              }
            ]}
              onClick={() => click(2)}>
              <h2>API</h2>
              <p>Use an api endpoint to upload</p>
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

            <center><Button
        onClick={() => APIcsv() }
      >
        Get csv
      </Button></center>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
      
    </Box>
    </>
  );
};
