import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Typography,Button,Drawer,List,ListItemIcon,ListItemText,Box,} from '@mui/material';
import {Menu as MenuIcon, Person, Home, Search, MilitaryTech, ScreenSearchDesktop, Cable} from '@mui/icons-material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import UploadIcon from '@mui/icons-material/Upload';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import { useEffect, useState } from 'react';

export const Layout = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const getCurrentPage = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/datasetsearch':
        return 'Search';
      case '/graph':
        return 'Graphs';
      case '/login':
        return 'Login';
      case '/register':
        return 'Register';
      case '/subsetsearch':
        return 'Subset Search';
      case '/acknowledgements':
        return "Acknowledgements";
      case "/distributed":
        return "Distributed Connection";
      case "/zoom":
        return "Graph Zoom";
      default:
        if (location.pathname.includes("/profile/")) {
          return "Profile";
        } else if (location.pathname.includes("/upload")) {
          return "Upload";
        } else {
          return 'Home';
        }
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: '#333', color: 'white', boxShadow: 'none', borderBottom: '1px solid #ddd' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="black"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getCurrentPage()}
          </Typography>
          {location.pathname !== '/login' ? (
            <>{props.user === undefined && 
            <Button color="inherit" component={Link} to="/login">
              Login or register
            </Button>}
            {props.user !== undefined && 
            <Button color="inherit" onClick={()=>{props.logout(); navigate('/')}}>
              Logout
            </Button>}</>
          ) : (
            <Button color="inherit" component={Link} to="/">
              Back
            </Button>
          )}        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ marginTop: '64px' }}>
        <Drawer
          variant="permanent"
          anchor="left"
          open={open}
          onClose={handleDrawerToggle}
          PaperProps={{
            style: {
              width: open ? 240 : 72,
              transition: 'width 225ms cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: '64px',
            },
          }}
        >
          <List component="nav">
            <ListItemButton component={Link} to="/" sx = {{ height: "50px" }}>
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>

            <ListItemButton component={Link} to="/datasetsearch" sx = {{ height: "50px" }}>
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <ListItemText primary="Dataset Search" />
            </ListItemButton>

            <ListItemButton component={Link} to="/subsetsearch" sx = {{ height: "50px" }}>
              <ListItemIcon>
                <ScreenSearchDesktop />
              </ListItemIcon>
              <ListItemText primary="Subset Search" />
            </ListItemButton>

            <ListItemButton component={Link} to='/graph' sx = {{ height: "50px" }}>
              <ListItemIcon>
                <ShowChartIcon/>
              </ListItemIcon>
              <ListItemText primary="Graphs" />
            </ListItemButton>

            <ListItemButton component={Link} to='/upload' sx = {{ height: "50px" }}>
              <ListItemIcon>
                <UploadIcon />
              </ListItemIcon>
              <ListItemText primary="Dataset Upload" />
            </ListItemButton>

            <ListItemButton component={Link} to='/distributed' sx = {{ height: "50px" }}>
              <ListItemIcon>
                <Cable />
              </ListItemIcon>
              <ListItemText primary="Create Distributed Connection" />
            </ListItemButton>

            {
              props.user !== undefined && 
              <ListItemButton component={Link} to={`/profile/${ props.user.username }`} sx = {{ height: "50px" }}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            }
            {
              props.user === undefined && 
              <ListItemButton component={Link} to={`/login`} sx = {{ height: "50px" }}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            }

            <ListItemButton component={Link} to='/acknowledgements' sx = {{ height: "50px" }}>
              <ListItemIcon>
                <MilitaryTech />
              </ListItemIcon>
              <ListItemText primary="Acknowledgements" />
            </ListItemButton>
            
            <Divider sx={{ my: 1 }} />
            

          </List>
        </Drawer>
        {/* Your main content */}
      </Box>
    </>
  );
}
