/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import SensorModal from './Components/SensorModal';

import { getSensorData } from '../../services/getSensorData';

import styles from './Admin2.module.css';

function RowActions({ sensor, setSelectedSensor, setOpenModal }) {
  return (
    <>
      <IconButton
        onClick={() => {
          setOpenModal(true);
          setSelectedSensor(sensor);
        }}
      >
        <EditIcon />
      </IconButton>
      <IconButton>
        <DeleteIcon />
      </IconButton>
    </>
  );
}

RowActions.propTypes = {
  sensor: PropTypes.shape({
    id_sensor: PropTypes.string,
    nombre: PropTypes.string,
    tipo: PropTypes.string,
    latitud: PropTypes.string,
    longitud: PropTypes.string,
    fecha_instalacion: PropTypes.string,
  }).isRequired,
  setSelectedSensor: PropTypes.func.isRequired,
  setOpenModal: PropTypes.func.isRequired,
};

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default function Admin2() {
  const [sensorData, setSensorData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState({});

  const fetchData = () => {
    getSensorData()
      .then((data) => {
        setSensorData(data);
      })
      .catch((error) => console.error('Error al obtener los datos:', error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'activo':
        return styles.activo;
      case 'inactivo':
        return styles.inactivo;
      case 'dañado':
        return styles.dañado;
      default:
        return ''; // Return an empty string or a default style
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSensor({});
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1} className="main-container">
        <Grid size={1} />
        <Grid size={10}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: '#AEDD94' }}>
                <TableRow>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">ID</TableCell>
                  <TableCell align="center">Nombre</TableCell>
                  <TableCell align="center">Tipo</TableCell>
                  <TableCell align="center">Latitud</TableCell>
                  <TableCell align="center">Longitud</TableCell>
                  <TableCell align="center">Fecha</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? sensorData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sensorData
                )?.map((sensor) => (
                  <TableRow
                    key={sensor.id_sensor + sensor.tipo}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="center">
                      <div className={styles.rowState}>
                        <FiberManualRecordIcon
                          className={`${styles.circle} ${getStatusClass(sensor.estado)}`}
                        />
                        {sensor.estado}
                      </div>
                    </TableCell>
                    <TableCell align="center">{sensor.id_sensor}</TableCell>
                    <TableCell align="center">{sensor.nombre}</TableCell>
                    <TableCell align="center">{sensor.tipo}</TableCell>
                    <TableCell align="center">{sensor.latitud}</TableCell>
                    <TableCell align="center">{sensor.longitud}</TableCell>
                    <TableCell align="center">{sensor.fecha_instalacion}</TableCell>
                    <TableCell align="center">
                      <RowActions
                        sensor={sensor}
                        setSelectedSensor={setSelectedSensor}
                        setOpenModal={setOpenModal}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[7, 14, 21, { label: 'All', value: -1 }]}
                    count={sensorData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    slotProps={{
                      select: {
                        inputProps: {
                          'aria-label': 'rows per page',
                        },
                        native: true,
                      },
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                    align="center"
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>
        <Grid size={1} />
      </Grid>
      <SensorModal
        open={openModal}
        handleClose={handleCloseModal}
        selectedSensor={selectedSensor}
      />
    </Box>
  );
}
