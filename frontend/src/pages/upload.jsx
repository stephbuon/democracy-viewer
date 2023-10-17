import { React, useState, useEffect } from "react";
import { upload } from "../api/api.js";

import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';


import { UploadModal } from './UploadModal';

// import fs from 'fs';

export const Upload = (props) => {
  const [file, setFile] = useState(undefined);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [passFile, setPassFile] = useState(undefined);
  const [fileHeaders, setFileHeaders] = useState(undefined);


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
  function print() {
    console.log(file);
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
          Only '.csv' files can be uploaded
        </Alert>
      </Snackbar>
      <Modal
        open={fileLoaded}
        onClose={() => handleDataSetInfo()}
      >
        <UploadModal
          // advancedFilterResults={(x) => advancedFilterResults(x)}
          CancelUpload={() => CancelUpload()}
          file={passFile}
          headers={fileHeaders}
        />
      </Modal>
      
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
      
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
      {passFile && 
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => { setFileLoaded(true) }}
        >
          Continue
        </Button>
      }
      {!passFile && 
        <Button variant="contained" color="primary" disabled>
          Continue
        </Button>
      }
    </Box>

      {/* <button
        className="btn btn-success"
        disabled={file == undefined}
        onClick={() => {
          upload(file[0]);
        }}
      >
        Upload
      </button> */}
      {/* <button
        className="btn btn-success"
        disabled={file == undefined}
        onClick={print}
      >
        Log File
      </button> */}
    </>
  );
};
