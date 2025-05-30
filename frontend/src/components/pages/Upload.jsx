import React, { useState, useEffect } from "react";
import { Container, Modal, Typography, Grid, Card, CardContent, CardActions, Button, Avatar, Box } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ApiIcon from "@mui/icons-material/Api";

import { UploadModal } from "./subcomponents/upload";
import { useNavigate } from "react-router-dom";

export const Upload = (props) => {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [uploadModeSelected, setUploadModeSelected] = useState(undefined);

  const CancelUpload = () => {
    setOpenModal(false);
  };

  const OpenModal = (mode) => {
    setUploadModeSelected(mode);
    setOpenModal(true);
  }

  const loggedIn = () => {
    if (props.currUser) {
      return true;
    } else {
      const demoV = JSON.parse(localStorage.getItem("democracy-viewer"));
      if (demoV && demoV.user) {
        return true;
      } else {
        return false;
      }
    }
  };

  useEffect(() => {
    if (!loggedIn()) {
      props.setNavigated(true);
      navigate("/login");
    }
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      <Modal open={openModal} onClose={() => CancelUpload()}>
        <div>
            <UploadModal CancelUpload={() => CancelUpload()} uploadType={uploadModeSelected} />
        </div>
      </Modal>

      <Container maxWidth="md" sx={{ py: 15 }}>
        
        <Typography 
          component="h1" 
          align="center" 
          sx={{ 
            fontSize: '3.1rem', 
            color: 'black',
            fontWeight: 500,
            mb: 6
        }} >
           Upload
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Card>
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Avatar sx={{ bgcolor: "#dcfce7", mb: 3, p: 3, width: 64, height: 64 }}>
                  <FileUploadIcon sx={{ color: "#10b981", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>CSV File</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload your dataset as a CSV file
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                <Button 
                  variant="contained" 
                  onClick={() => OpenModal("csv")}
                  fullWidth
                >
                  CSV File
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={5}>
            <Card>
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Avatar sx={{ bgcolor: "#dbeafe", mb: 3, p: 3, width: 64, height: 64 }}>
                  <ApiIcon sx={{ color: "#3b82f6", fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>API</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connect to an external API
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                <Button 
                  variant="contained" 
                  onClick={() => OpenModal("api")}
                  fullWidth
                >
                  API
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};