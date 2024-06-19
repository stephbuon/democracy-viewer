// Based on: https://mui.com/material-ui/react-dialog/

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export const AlertDialog = ({ open, setOpen, titleText, bodyText, action, disabled }) => {
  const handleClose = () => {
    setOpen(false);
  };

  const confirmAction = () => {
    action();
    handleClose();
  };

  return (
    <>
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
          <Button onClick={confirmAction} disabled = {disabled}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}