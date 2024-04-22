import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {AppBar,Toolbar,IconButton,Typography,Button,Drawer,List,ListItem,ListItemIcon,ListItemText,Box,} from '@mui/material';
import {Menu as MenuIcon,Home as HomeIcon,BarChart as BarChartIcon,Person,Home,Search,} from '@mui/icons-material';
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
        if (location.pathname.includes("/Profile/")) {
          return "Profile";
        } else {
          return 'Home';
        }
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={{ backgroundColor: "#0766BD" }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
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
            <Button color="inherit" component={Link} to="/login">
              Login or register
            </Button>
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
              backgroundColor: "#9FE0F4"
            },
          }}
        >
          <List component="nav">
            <ListItemButton component={Link} to="/" sx={{ pt: 3 }} >
              <ListItemIcon>
                <Home sx = {{ color: "#FFFFFF" }}/>
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/datasetsearch" sx={{ pt: 3 }}>
              <ListItemIcon>
                <Search sx = {{ color: "#FFFFFF"}}/>
              </ListItemIcon>
              <ListItemText primary="Search" />
            </ListItemButton>
            <ListItemButton component={Link} to="/subsetsearch" sx={{ pt: 3 }}>
              <ListItemIcon>
                <ManageSearchIcon sx = {{ color: "#FFFFFF"}}/>
              </ListItemIcon>
              <ListItemText primary="Subset Search" />
            </ListItemButton>
            <ListItemButton sx={{ pt: 3 }}>
              <ListItemIcon>
                <PeopleIcon sx = {{ color: "#FFFFFF"}}/>
              </ListItemIcon>
              <ListItemText primary="Groups" />
            </ListItemButton>
            <ListItemButton component={Link} to='/graph'>
              <ListItemIcon>
                <BarChartIcon sx = {{ color: "#FFFFFF"}}/>
              </ListItemIcon>
              <ListItemText primary="Upload/Edit Data Sets" />
            </ListItemButton>
            {props.user !== undefined && <ListItemButton component={Link} to={`/Profile/${ props.user.username }`}>
              <ListItemIcon>
                <Person sx = {{ color: "#FFFFFF"}}/>
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>}
            {props.user === undefined && <ListItemButton component={Link} to={`/login`}>
              <ListItemIcon>
                <Person sx = {{ color: "#FFFFFF"}}/>
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


