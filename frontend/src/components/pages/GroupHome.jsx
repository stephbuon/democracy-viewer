import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const theme = createTheme();
import { Link, useNavigate } from "react-router-dom";

export const GroupHome = (props) => {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>
          
    </ThemeProvider>
  );
}