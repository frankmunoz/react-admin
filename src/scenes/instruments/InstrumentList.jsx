  // InstrumentList.js
  import React, { useState, useEffect } from 'react';
  import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
  import { DataGrid, GridToolbar } from '@mui/x-data-grid';
  import InstrumentForm from './InstrumentForm';
  import { useTheme } from '@mui/material';

  const InstrumentList = () => {
    const theme = useTheme();

    const [instrumentos, setInstrumentos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDataGrid, setShowDataGrid] = useState(true);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const fetchData = async () => {
      try {
        const response = await fetch('/instrumentos/listar');
        if (!response.ok) {
          throw new Error('Error al obtener la lista de instrumentos');
        }

        const data = await response.json();

        const instrumentosConId = data.map((instrumento, index) => ({
          ...instrumento,
          id: index + 1,
        }));

        setInstrumentos(instrumentosConId);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    const handleSubmitInstrument = async (values) => {
      const updatedValues = { ...values };
      const newImages = values.imagen.filter(image => !selectedInstrument.imagen.some(oldImage => oldImage.url === image.url));
      updatedValues.imagen = newImages;

      const { categoria, ...restValues } = updatedValues;
      const valuesToSend = { ...restValues, categoria: values.categoria.categoria_id };

      selectedInstrument  ? handleUpdateInstrument(valuesToSend) : handleAddInstrument(valuesToSend);

      setSelectedInstrument(null);
      setShowForm(false); 
      setShowDataGrid(true);
    }

    const handleAddInstrument = async (values) => {
      try {
        const response = await fetch('/instrumentos/agregar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Error al agregar el instrumento');
        }

        fetchData();
        setShowForm(false);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleUpdateInstrument = async (values) => {
      try {
        const response = await fetch('/instrumentos/modificar', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Error al agregar el instrumento');
        }

        fetchData();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleEditInstrument = (instrumento) => {
      setSelectedInstrument(instrumento);
      setShowForm(true);
      setShowDataGrid(false);
    };

    const handleDeleteInstrument = () => {
      // Aquí puedes implementar la lógica de eliminación del instrumento
      setConfirmDelete(false);
    };

    const columns = [
      { field: 'id', headerName: 'ID', flex: 0.5 },
      { field: 'nombre', headerName: 'Nombre', flex: 1 },
      {
        field: 'imagen',
        headerName: 'Imagen',
        flex: 1,
        renderCell: (params) => (
          <img
            src={params.row.imagen.length > 0 ? params.row.imagen[0].url : ''}
            alt={params.row.nombre}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
        ),
      },
      {
        field: 'acciones',
        headerName: 'Acciones',
        flex: 1,
        renderCell: (params) => (
          <div>
            <Button onClick={() => handleEditInstrument(params.row)} color="secondary">
              Editar
            </Button>
            <Button onClick={() => setConfirmDelete(true)} color="error">
              Eliminar
            </Button>
          </div>
        ),
      },
    ];

    const getRowId = (row) => row.id;

    return (
      <Box m="20px" height="500px">
          <Typography variant="h5" gutterBottom>
            Gestionar Instrumentos
          </Typography>
        {showDataGrid && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setSelectedInstrument(null);
              setShowForm(true);
              setShowDataGrid(false);
            }}
            sx={{ marginBottom: '20px' }}
          >
            Agregar Instrumento
          </Button>
        )}

        {showForm && (
          <InstrumentForm
            onSubmit={handleSubmitInstrument}
            initialValues={selectedInstrument}
            instrumento={selectedInstrument}
            onCancel={() =>{setShowForm(false); setShowDataGrid(true)} }
          />          
        )}

        {showDataGrid && (
          <DataGrid
            rows={instrumentos}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            getRowId={getRowId}
          />
        )}

        {/* Confirmación antes de eliminar */}
        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar este instrumento?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDelete(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDeleteInstrument} color="error">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  export default InstrumentList;
