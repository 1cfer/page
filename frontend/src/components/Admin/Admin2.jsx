/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect } from 'react';
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
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useMutation, useQuery } from '@tanstack/react-query';

import DeviceRow from './Components2/DeviceRow';
import TablePaginationActions from './Components2/TablePaginationActions';
import DeviceModal from './Components2/DeviceModal';
import VariableModal from './Components2/VariableModal';
import GreenModal from '../shared/GreenModal/GreenModal';

export default function Admin2() {
  const [openModal, setOpenModal] = useState(false);
  const [openVariableModal, setOpenVariableModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState({});
  const [sensorData, setSensorData] = useState([]);
  const [mode, setMode] = useState('Create');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  const { isPending, data: variablesData } = useQuery({
    queryKey: ['variableData'],
    queryFn: () => fetch('/v2/entities?id=variablelist').then((res) => res.json()),
  });

  const mutation = useMutation({
    queryKey: ['getEntities'],
    mutationFn: () => fetch('/v2/entities?type=device').then((res) => res.json()),
    onSuccess: (data) => {
      setSensorData(data);
    },
    onError: (error) => {
      console.error('Error getting entities:', error.message);
    },
  });

  const deleteDeviceMutation = useMutation({
    queryKey: ['deleteEntity'],
    mutationFn: () =>
      fetch(`/v2/entities/${selectedSensor.id}`, {
        method: 'DELETE',
      }).then((res) => res),
    onSuccess: () => {
      mutation.mutate();
      setOpenDeleteModal(false);
    },
    onError: (error) => {
      console.error('Error deleting device:', error.message);
    },
  });

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

  useEffect(() => {
    mutation.mutate();
  }, []);

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || deleteDeviceMutation.isPending || isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={1} className="main-container">
          {isAdmin && (
            <>
              <Grid size={8} />
              <Grid size={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#3FC244' }}
                  onClick={() => {
                    setOpenVariableModal(true);
                  }}
                >
                  New Variable
                </Button>
              </Grid>
              <Grid size={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#3FC244' }}
                  onClick={() => {
                    setOpenModal(true);
                    setMode('Create');
                  }}
                >
                  New Device
                </Button>
              </Grid>
              <Grid size={1} />
            </>
          )}
          <Grid size={1} />
          <Grid size={10}>
            <TableContainer component={Paper} sx={{ marginTop: '2%' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ backgroundColor: '#AEDD94' }}>
                  <TableRow>
                    <TableCell />
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Latitude</TableCell>
                    <TableCell align="center">Longitude</TableCell>
                    <TableCell align="center">Date</TableCell>
                    {isAdmin && <TableCell align="center">Actions</TableCell>}
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
                      setOpenDeleteModal={setOpenDeleteModal}
                      variablesData={variablesData}
                      setMode={setMode}
                    />
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[6, 12, 18, { label: 'All', value: -1 }]}
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
        <DeviceModal
          open={openModal}
          handleClose={handleCloseModal}
          selectedSensor={selectedSensor}
          getDevices={mutation.mutate}
          variablesData={variablesData}
          mode={mode}
        />
        <VariableModal
          open={openVariableModal}
          setOpen={setOpenVariableModal}
          getDevices={mutation.mutate}
          variablesData={variablesData}
        />
        <GreenModal
          modalText={`Do you want to delete ${selectedSensor.id}?`}
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          acceptFunction={deleteDeviceMutation.mutate}
        />
      </Box>
    </>
  );
}
