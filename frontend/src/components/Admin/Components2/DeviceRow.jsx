import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import RowActions from './RowActions';

import styles from './DeviceRow.module.css';

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return styles.active;
    case 'inactive':
      return styles.inactive;
    case 'damaged':
      return styles.damaged;
    default:
      return ''; // Return an empty string or a default style
  }
};

const getUnit = (variable) => {
  switch (variable) {
    case 'temperature':
      return '°C';
    case 'humidity':
      return '%';
    default:
      return '';
  }
};

export default function DeviceRow({ sensor, setSelectedSensor, setOpenModal, setOpenDeleteModal }) {
  const keys = Object.keys(sensor);
  const variables = keys.filter(
    (key) =>
      key !== 'id' &&
      key !== 'type' &&
      key !== 'creationdate' &&
      key !== 'location' &&
      key !== 'state'
  );
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="center">
          <div className={styles.rowState}>
            <FiberManualRecordIcon
              className={`${styles.circle} ${getStatusClass(sensor.state.value)}`}
            />
            {sensor.state.value}
          </div>
        </TableCell>
        <TableCell align="center">{sensor.id}</TableCell>
        <TableCell align="center">{sensor.location.value.coordinates[0]}</TableCell>
        <TableCell align="center">{sensor.location.value.coordinates[1]}</TableCell>
        <TableCell align="center">{sensor.creationdate.value}</TableCell>
        <TableCell align="center">
          <RowActions
            sensor={sensor}
            setSelectedSensor={setSelectedSensor}
            setOpenModal={setOpenModal}
            setOpenDeleteModal={setOpenDeleteModal}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead sx={{ backgroundColor: '#31DE38' }}>
                  <TableRow>
                    <TableCell>Variable</TableCell>
                    <TableCell>Último valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variables.map((variable) => (
                    <TableRow key={variable}>
                      <TableCell component="th" scope="row">
                        {variable}
                      </TableCell>
                      <TableCell>{`${sensor[variable].value} ${getUnit(variable)}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

DeviceRow.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.string,
    state: PropTypes.shape({
      value: PropTypes.string,
    }),
    location: PropTypes.shape({
      value: PropTypes.string,
    }),
    creationdate: PropTypes.string,
  }).isRequired,
  setSelectedSensor: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  setOpenDeleteModal: PropTypes.func.isRequired,
};
