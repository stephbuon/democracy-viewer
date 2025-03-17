import { Container, Box, Typography } from "@mui/material";

export const UploadComplete = () => {
    return (
        <Container maxWidth="sm" sx={{ mt: "150px", textAlign: "center" }}>
            <Box
                sx={{
                    backgroundColor: "#f0f0f0", // Light gray background
                    padding: "20px",
                    borderRadius: "10px",
                    display: "inline-block",
                    textAlign: "center",
                }}
            >
                <Typography variant="h6">
                    Your dataset is processing. Search is available, but visualization is disabled until processing is complete. We'll email you when it's done—check your junk folder if needed.
                </Typography>
            </Box>
        </Container>
    );
};
