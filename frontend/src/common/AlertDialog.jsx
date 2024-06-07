// Based on: https://mui.com/material-ui/react-dialog/

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog({ buttonText, titleText, bodyText, action }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const confirmAction = () => {
    action();
    handleClose();
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        { buttonText }
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          { titleText }
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            { bodyText }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={confirmAction}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}