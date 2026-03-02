import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import DeviceRow from './Components/DeviceRow';
import DeviceModal from './Components/DeviceModal';
import VariableModal from './Components/VariableModal';
import GreenModal from '../shared/GreenModal/GreenModal';

import styles from './Admin.module.css';

export default function Admin() {
  const queryClient = useQueryClient();

  const [openModal,         setOpenModal]         = useState(false);
  const [openVariableModal, setOpenVariableModal] = useState(false);
  const [openDeleteModal,   setOpenDeleteModal]   = useState(false);
  const [selectedSensor,    setSelectedSensor]    = useState({});
  const [mode,              setMode]              = useState('Create');
  const [page,              setPage]              = useState(0);
  const [rowsPerPage,       setRowsPerPage]       = useState(6);

  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const token   = localStorage.getItem('access_token');

  const { isPending: variablesPending, data: variablesData, refetch: refetchVariables } = useQuery({
    queryKey: ['variableData'],
    queryFn:  () =>
      fetch('/v2/entities?id=variablelist', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
  });

  const { isPending: devicesPending, data: sensorData, refetch: refetchDevices } = useQuery({
    queryKey: ['getEntities'],
    queryFn:  () =>
      fetch('/v2/entities?type=device', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    refetchInterval: 3000,
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: () =>
      fetch(`/v2/entities/${selectedSensor.id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => { handleRefreshAll(); setOpenDeleteModal(false); },
    onError:   (e) => console.error('Error deleting device:', e.message),
  });

  const handleRefreshAll = () => {
    refetchDevices();
    refetchVariables();
    queryClient.invalidateQueries({ queryKey: ['variableData'] });
    queryClient.invalidateQueries({ queryKey: ['getEntities'] });
  };

  const handleCloseModal = () => { setOpenModal(false); setSelectedSensor({}); };

  const visibleRows = rowsPerPage > 0
    ? (sensorData || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : (sensorData || []);

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', position: 'fixed', zIndex: 1700 }}
        open={devicesPending || deleteDeviceMutation.isPending || variablesPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box sx={{ px: { xs: 2, md: '5%' }, pt: '28px', pb: '60px' }}>

        {/* ── Toolbar ── */}
        {isAdmin && (
          <div className={styles.toolbar}>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setOpenVariableModal(true)}>
              Manage Variables
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => { setOpenModal(true); setMode('Create'); }}
            >
              <span className={styles.btnPlus}>＋</span> New Device
            </button>
          </div>
        )}

        {/* ── Table Shell ── */}
        <div className={styles.tableShell}>

          {/* ── Header ──
              grid-template-columns MUST be identical to
              .mainRow in DeviceRow.module.css             */}
          <div className={styles.tableHeader}>
            <div className={styles.headerRow}>
              <div />                                                  {/* chevron col */}
              <div className={styles.th}>Status</div>
              <div className={styles.th}>Name</div>
              <div className={`${styles.th} ${styles.thCenter}`}>Latitude</div>
              <div className={`${styles.th} ${styles.thCenter}`}>Longitude</div>
              <div className={styles.th}>Date</div>
              {isAdmin && <div className={`${styles.th} ${styles.thCenter}`}>Actions</div>}
            </div>
          </div>

          {/* ── Rows ── */}
          <div className={styles.tableBody}>
            {visibleRows.length === 0 && !devicesPending && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📡</span>
                <p>No devices found</p>
              </div>
            )}
            {visibleRows.map((sensor, i) => (
              <div key={sensor.id} style={{ animationDelay: `${i * 45}ms` }}>
                <DeviceRow
                  sensor={sensor}
                  setSelectedSensor={setSelectedSensor}
                  setOpenModal={setOpenModal}
                  setOpenDeleteModal={setOpenDeleteModal}
                  variablesData={variablesData}
                  setMode={setMode}
                />
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          <div className={styles.paginationRow}>
            <TablePagination
              component="div"
              rowsPerPageOptions={[6, 12, 18, { label: 'All', value: -1 }]}
              count={sensorData?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize:   '12px',
                color:      '#64748b',
                '& .MuiTablePagination-select':    { fontFamily: 'DM Mono, monospace', fontSize: '12px' },
                '& .MuiTablePagination-displayedRows': { fontFamily: 'DM Mono, monospace', fontSize: '12px' },
                '& .MuiTablePagination-selectLabel':   { fontFamily: 'DM Sans, sans-serif', fontSize: '12px' },
              }}
            />
          </div>
        </div>
      </Box>

      <DeviceModal
        open={openModal}
        handleClose={handleCloseModal}
        selectedSensor={selectedSensor}
        getDevices={handleRefreshAll}
        variablesData={variablesData}
        mode={mode}
      />
      <VariableModal
        open={openVariableModal}
        setOpen={setOpenVariableModal}
        getDevices={handleRefreshAll}
        variablesData={variablesData}
      />
      <GreenModal
        modalText={`Do you want to delete ${selectedSensor.id}?`}
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        acceptFunction={() => deleteDeviceMutation.mutate()}
      />
    </>
  );
}