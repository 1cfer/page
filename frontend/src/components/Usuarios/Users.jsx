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
import { useMutation } from '@tanstack/react-query';

import TablePaginationActions from '../Admin/Components2/TablePaginationActions';
import GreenModal from '../shared/GreenModal/GreenModal';
import { getUsers } from '../../services/users';
import UserModal from './UserModal';
import RowActions from '../Admin/Components2/RowActions';

const getAdmins = async () => {
  const response = await fetch('/idm/admins/administrators/list', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get user admins');
  }

  return response.json();
};

export default function Users() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [usersData, setUsersData] = useState({});
  const [admins, setAdmins] = useState({});
  const [adminArray, setAdminArray] = useState([]);

  const checkUserRole = (userId) => {
    return adminArray.includes(userId) ? 'admin' : 'user';
  };

  const mutation = useMutation({
    mutationFn: getUsers,
    onSuccess: (data) => {
      setUsersData(data);
    },
    onError: (error) => {
      console.error('Error getting users:', error.message);
    },
  });

  const adminMutation = useMutation({
    mutationFn: getAdmins,
    onSuccess: (data) => {
      setAdmins(data);
    },
    onError: (error) => {
      console.error('Error getting admins:', error.message);
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    mutation.mutate();
    adminMutation.mutate();
  }, []);

  useEffect(() => {
    const tempArray = [];
    admins?.admin_users?.forEach((admin) => tempArray.push(admin.id));
    setAdminArray(tempArray);
  }, [admins]);

  return (
    <>
      <Backdrop
        sx={() => ({ color: '#fff', position: 'fixed', zIndex: 1700 })}
        open={mutation.isPending || adminMutation.isPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={1} className="main-container">
          <Grid size={10} />
          <Grid size={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              sx={{ bgcolor: '#3FC244' }}
              onClick={() => {
                setOpenUserModal(true);
              }}
            >
              New User
            </Button>
          </Grid>
          <Grid size={1} />
          <Grid size={1} />
          <Grid size={10}>
            <TableContainer component={Paper} sx={{ marginTop: '2%' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ backgroundColor: '#AEDD94' }}>
                  <TableRow>
                    <TableCell align="center">Nombre de usuario</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Rol</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? usersData?.users?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : usersData?.users
                  )?.map((user) => (
                    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                      <TableCell align="center">{user?.username}</TableCell>
                      <TableCell align="center">{user?.email}</TableCell>
                      <TableCell align="center">{checkUserRole(user?.id)}</TableCell>
                      <TableCell align="center">
                        <RowActions
                          sensor={user}
                          /* setSelectedSensor={setSelectedSensor}
                          setOpenModal={setOpenModal}
                          setOpenDeleteModal={setOpenDeleteModal}
                          setMode={setMode}  */
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[6, 12, 18, { label: 'All', value: -1 }]}
                      count={usersData?.users?.length}
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
      </Box>
      <UserModal
        open={openUserModal}
        setOpen={setOpenUserModal}
        getUsers={mutation.mutate}
        adminArray={adminArray}
        getAdmins={adminMutation.mutate}
      />
    </>
  );
}
