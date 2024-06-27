import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Typography,Button,Drawer,List,ListItem,ListItemIcon,ListItemText,Box,} from '@mui/material';
import {Menu as MenuIcon,Home as HomeIcon,Person,Home,Search,} from '@mui/icons-material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import UploadIcon from '@mui/icons-material/Upload';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import PeopleIcon from '@mui/icons-material/People';
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
      default:
        if (location.pathname.includes("/profile/")) {
          return "Profile";
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
            <MenuIcon />
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
            <ListItemButton component={Link} to="/" sx={{ pt: 3 }} >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/datasetsearch" sx={{ pt: 3 }}>
              <ListItemIcon>
                <Search />
              </ListItemIcon>
              <ListItemText primary="Dataset Search" />
            </ListItemButton>

            <ListItemButton sx={{ pt: 3 }} component={Link} to='/graph'>
              <ListItemIcon>
                <ShowChartIcon/>
              </ListItemIcon>
              <ListItemText primary="Graphs" />
            </ListItemButton>
            <ListItemButton component={Link} to='/upload'>
              <ListItemIcon>
                <UploadIcon />
              </ListItemIcon>
              <ListItemText primary="Upload/Edit Data Sets" />
            </ListItemButton>
            {props.user !== undefined && <ListItemButton component={Link} to={`/profile/${ props.user.username }`}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>}
            {props.user === undefined && <ListItemButton component={Link} to={`/login`}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>}
            
            <Divider sx={{ my: 1 }} />
            

          </List>
        </Drawer>
        {/* Your main content */}
      </Box>
    </>
  );
}
