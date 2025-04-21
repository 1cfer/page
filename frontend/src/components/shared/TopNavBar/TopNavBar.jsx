import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Grid from '@mui/material/Grid2';

import AgevitalLogo from "../../../assets/agevitalLogo.png";

export default function TopNavBar({setOpenSideNavBar}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);

      // Decodificar el token para obtener el rol
      const decodedToken = jwtDecode(token);
      setUserRole(decodedToken.role);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid size={1}>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={ () => setOpenSideNavBar(true) } 
                >
                    <MenuIcon />
                </IconButton>
            </Grid>
            <Grid size={4}></Grid>
            <Grid size={2}>
                <img src={AgevitalLogo} width={"200px"}/>
            </Grid>
            <Grid size={4}></Grid>
            <Grid size={1}>
                {isAuthenticated && (
                    <div>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleClose}>Profile</MenuItem>
                        <MenuItem onClick={handleClose}>My account</MenuItem>
                    </Menu>
                    </div>
                )}
            </Grid>
          </Grid>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
