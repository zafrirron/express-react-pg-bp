import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Avatar, CssBaseline, Divider, Collapse } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import routesConfig from '../common/routesConfig';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import * as Icons from '@mui/icons-material'; // Import all MUI icons

const drawerWidth = 240;
const collapsedWidth = 100;

const DynamicIcon = ({ iconName }) => {
  const IconComponent = Icons[iconName]; // Dynamically select the icon based on the string
  if (!IconComponent) {
    return null; // Fallback if the icon doesn't exist
  }
  return <IconComponent />;
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State for dropdown menu
  const [openMenu, setOpenMenu] = useState({}); // Track which menu items are expanded
  const { role, userInfo, setRole } = useAuth();  // Add userInfo

  // Toggle menu open/close state
  const handleToggleMenu = (menuKey) => {
    setOpenMenu((prevOpen) => ({
      ...prevOpen,
      [menuKey]: !prevOpen[menuKey],
    }));
  };

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget); // Open the dropdown menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the dropdown menu
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT token
    setRole('unlogged'); // Update the role to 'unlogged'
    navigate('/login'); // Redirect to login page after logout
    handleMenuClose();
  };

  const renderMenuItems = (routes) => {
    if (!routes || typeof routes !== 'object') return null;

    // Set the cookie properly
    const token = localStorage.getItem('token');
    if (token) {
      const secureFlag = window.location.protocol === 'https:' ? 'secure;' : '';
      document.cookie = `token=${token}; path=/; ${secureFlag} SameSite=Lax`;
    }

    return Object.keys(routes).map((routeKey) => {
      const route = routes[routeKey];
      const IconComponent = route?.icon;
      const hasChildren = route?.children && typeof route.children === 'object';
      const menuText=routeKey.charAt(0).toUpperCase() + routeKey.slice(1)

      // Check if the route is an external link
      if (route.external && route.frontendVisible) {
        return (
          <ListItem
            button="true"
            key={routeKey}
            onClick={() => window.open(route.url, '_blank')} // Open in a new tab
            sx={{ cursor: 'pointer' }}
          >
            {IconComponent && <ListItemIcon title={menuText}><DynamicIcon iconName={route.icon}/></ListItemIcon>}
            {!isCollapsed && <ListItemText primary={menuText} />}
          </ListItem>
        );
      }

      if ((route.roles.includes(role) && route.frontendVisible) || (role === 'admin' && route.frontendVisible)) {
        return (
          <React.Fragment key={route.path}>
            <ListItem button="true" onClick={hasChildren ? () => handleToggleMenu(routeKey) : () => handleNavigation(route.path)} sx={{ cursor: 'pointer' }}>
              {IconComponent && <ListItemIcon title={menuText}><DynamicIcon iconName={route.icon} /></ListItemIcon>}
              {!isCollapsed && <ListItemText primary={menuText} />}
              {hasChildren && (openMenu[routeKey] ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            {hasChildren && (
              <Collapse in={openMenu[routeKey]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderMenuItems(route.children)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      }
      return null;
    });
  };

  const appName = process.env.REACT_APP_APP_NAME || 'App Name';  // Fetch app name from .env

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${isCollapsed ? collapsedWidth : drawerWidth}px)`, ml: `${isCollapsed ? collapsedWidth : drawerWidth}px` }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Centered App Name */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
            {appName}
          </Typography>

          {/* Right-side actions (Login or Profile) */}
          {role === 'unlogged' && <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>}
          {role !== 'unlogged' && (
            <>
              <IconButton color="inherit" onClick={handleMenuClick}>
                <Avatar>{userInfo.name.charAt(0).toUpperCase()}</Avatar> {/* Display the first letter of the user's name */}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {/* User Info */}
                <MenuItem disabled>
                  <Typography variant="subtitle1">{userInfo.name}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="body2">{userInfo.email}</Typography>
                </MenuItem>
                <Divider />
                {/* Action Links */}
                <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: isCollapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? collapsedWidth : drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.3s',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {renderMenuItems(routesConfig.routes)}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
