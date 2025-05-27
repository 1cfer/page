/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react';
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
import { useQuery } from '@tanstack/react-query';

import DeviceRow from './Components2/DeviceRow';
import TablePaginationActions from './Components2/TablePaginationActions';
import SensorModal from './Components/SensorModal';

export default function Admin2() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState({});

  const {
    isPending,
    error,
    data: sensorData,
  } = useQuery({
    queryKey: ['getEntities'],
    queryFn: () => fetch('/v2/entities?type=sensor').then((res) => res.json()),
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
                  <TableCell />
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Nombre</TableCell>
                  <TableCell align="center">Latitud</TableCell>
                  <TableCell align="center">Longitud</TableCell>
                  <TableCell align="center">Fecha</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? sensorData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : sensorData
                )?.map((sensor) => (
                  <DeviceRow
                    sensor={sensor}
                    setSelectedSensor={setSelectedSensor}
                    setOpenModal={setOpenModal}
                  />
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[7, 14, 21, { label: 'All', value: -1 }]}
                    count={sensorData?.length}
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
