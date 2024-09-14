import { Container } from "@mui/material";

export const UploadComplete = () => {
    return <>
        <Container maxWidth="sm" sx = {{"mt": "100px"}}>
            <p>
                Your dataset is being processed! You can now search the data, but graphing is disabled until processing is complete. We will send you an email once processing is complete. Please check your junk mail if you do not see the confirmation email.
            </p>
        </Container>
    </>
}