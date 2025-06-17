import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const ConcordanceView = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ 
            width: '100%', 
            height: '80vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            px: 2
        }}>
            <Typography variant="h3" sx={{ fontWeight: 500, mb: 2 }}>
                Welcome to the Concordance View
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Used to see the keywords in context
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Go Back to Home
            </Button>
        </Box>
    );
};

export default ConcordanceView;
