import {
    Alert, Box, Button, CircularProgress, Modal,
    Snackbar, Tooltip, Typography
} from '@mui/material';
import { useState } from "react";
import { FormattedMultiTextField } from '../../../common/forms';
import { sendGroupInvites } from '../../../../api';

export const GroupSendInviteModal = (props) => {
    const [alert, setAlert] = useState(0);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleClose = () => props.setOpen(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await sendGroupInvites(props.group.id, emails);
            setAlert(1);
            handleClose();
            // setEmails([]);
        } catch (err) {
            console.error(err);
            setAlert(2);
        }
        setLoading(false);
    }

    return <>
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={alert > 0}
            autoHideDuration={6000}
            onClose={() => setAlert(0)}
        >
            <Alert onClose={() => setAlert(0)} severity={alert > 1 ? "error" : "success"} sx={{ width: '100%' }}>
                {alert === 1 && <>Successfully sent invites! You will be emailed a report on which emails matched a Democracy Viewer account.</>}
                {alert === 2 && <>Failed to send invites. Please refresh and try again.</>}
            </Alert>
        </Snackbar>

        <Modal
            open={props.open}
            onClose={() => handleClose()}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '7.5%',
                    left: '15%',
                    height: "75%",
                    overflow: "scroll",
                    width: "70%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em",
                    // paddingBottom: "15px"
                }}
            >
                <Typography variant="h2">Send Invites to Group</Typography>
                <FormattedMultiTextField
                    id="email"
                    label="Email Address"
                    variant="filled"
                    fullWidth
                    email
                    required
                    sx={{ background: 'rgb(255, 255, 255)' }}
                    words={emails}
                    setWords={setEmails}
                    maxChars={30}
                    autoComplete="email"
                />

                {
                    emails.length > 0 &&
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mb: 2, mt: 3, bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                        disabled={loading}
                        onClick={() => handleSubmit()}
                    >
                        Submit
                    </Button>
                }
                
                {
                    emails.length === 0 &&
                    <Tooltip title = "You must provide at least one email to send an invite to" arrow> 
                        <div>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mb: 2, mt: 3, bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}
                                disabled={true}
                            >
                                Submit
                            </Button>
                        </div>
                    </Tooltip>
                }

                {
                    loading && <CircularProgress color = "inherit" size = {20}/>
                }
            </Box>
        </Modal>
    </>
}