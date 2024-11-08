import { Container } from "@mui/material";

export const UploadComplete = () => {
    return <>
        <Container maxWidth="sm" sx = {{"mt": "100px"}}>
            <p>
            Your dataset is processing. Search is available, but visualization is disabled until processing is complete. We'll email you when it's done—check your junk folder if needed
            </p>
        </Container>
    </>
}