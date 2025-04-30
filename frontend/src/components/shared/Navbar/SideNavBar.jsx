import React from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PlaceIcon from '@mui/icons-material/Place';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import SensorOccupiedRoundedIcon from '@mui/icons-material/SensorOccupiedRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

export default function SideNavBar({ openSideNavBar, setOpenSideNavBar }) {
  const navigate = useNavigate();

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setOpenSideNavBar(false)}>
      <Toolbar />
      <Divider />
      <List>
        <ListItem key="Home" disablePadding>
          <ListItemButton onClick={() => navigate('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Sensors" disablePadding>
          <ListItemButton onClick={() => navigate('/admin')}>
            <ListItemIcon>
              <QueryStatsIcon />
            </ListItemIcon>
            <ListItemText primary="Sensors" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Location" disablePadding>
          <ListItemButton onClick={() => navigate('/mapa')}>
            <ListItemIcon>
              <PlaceIcon />
            </ListItemIcon>
            <ListItemText primary="Location" />
          </ListItemButton>
        </ListItem>
        <ListItem key="3D" disablePadding>
          <ListItemButton onClick={() => navigate('/threed')}>
            <ListItemIcon>
              <ViewInArRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="3D" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Users" disablePadding>
          <ListItemButton onClick={() => navigate('/usuarios')}>
            <ListItemIcon>
              <SensorOccupiedRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>
        </ListItem>
        <ListItem key="Dashboard" disablePadding>
          <ListItemButton onClick={() => navigate('/dashboard')}>
            <ListItemIcon>
              <DashboardRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div>
      <Drawer open={openSideNavBar} onClose={() => setOpenSideNavBar(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}

SideNavBar.propTypes = {
  openSideNavBar: PropTypes.bool.isRequired,
  setOpenSideNavBar: PropTypes.func.isRequired,
};
