import React, { useEffect, useState } from 'react';
import Swal from "sweetalert2";
import "./Usuarios.css";
import { getUsers } from '../../services/getUsers';
import { registerUser } from '../../services/registerUser';
import { deleteUser } from '../../services/deleteUser';
import { changePassword } from '../../services/changePassword';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const token = localStorage.getItem("access_token");
    const buttoncolor = getComputedStyle(document.documentElement).getPropertyValue('--color-principal').trim()


    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsuarios(data);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
    
        if (usuarios.some(user => user.email === email)) {
            Swal.fire('Error', 'El correo electrónico ya está en uso.', 'error');
            return;
        }
    
        try {
            const newUser = await registerUser(username, email, password, role);
            if (newUser && newUser.message === "Usuario registrado exitosamente") {
                setUsuarios((prevUsuarios) => [...prevUsuarios, { username, email, role }]);
                window.location.reload();
                resetForm();
                Swal.fire('Éxito', newUser.message, 'success');
            } else {
                Swal.fire('Error', 'Hubo un problema al registrar el usuario.', 'error');
            }
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            Swal.fire('Error', 'Error al registrar usuario', 'error');
        }
    };
    
    
    

    /*const handleEditUser = (user) => {
        setIsEditing(true);
        setEditId(user.id);
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setPassword('');
    };*/

    const handleChangePassword = async (userId) => {
        setIsChangingPassword(true);
        setEditId(userId);  // Guardamos el ID del usuario al que se le cambiará la contraseña
    };

    // Manejo del cambio de contraseña
    const handleSubmitChangePassword = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            alert('Por favor, ingrese una nueva contraseña.');
            return;
        }

        try {
            const response = await changePassword(editId, newPassword, token);
            if (response && response.message === 'Contraseña actualizada exitosamente') {
                Swal.fire('Exito', 'Contraseña cambiada exitosamente', 'success');
                setIsChangingPassword(false); // Cerrar formulario de cambio de contraseña
                setNewPassword(''); // Limpiar el campo de nueva contraseña
            } else {
                Swal.fire('Error', 'Hubo un error al cambiar la contraseña.', 'error');
            }
        } catch (error) {
            console.error("Error al cambiar la contraseña:", error);
            Swal.fire('Error', 'Hubo un error al cambiar la contraseña.', 'error');
        }
    };
    

    const handleUpdateUser = (e) => {
        e.preventDefault();

        if (usuarios.some(user => user.email === email && user.id !== editId)) {
            alert('El correo electrónico ya está en uso.');
            return;
        }

        setUsuarios(
            usuarios.map((user) =>
                user.id === editId ? { ...user, username, email, role } : user
            )
        );
        resetForm();
    };



    const handleDeleteUser = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: buttoncolor,
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await deleteUser(id, token);
                    if (response && response.message.includes('eliminado exitosamente')) {
                        setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.id !== id));
                        Swal.fire(
                            'Eliminado!',
                            'El usuario ha sido eliminado.',
                            'success'
                        );
                    } else {
                        Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
                    }
                } catch (error) {
                    console.error("Error al intentar eliminar el usuario:", error);
                    Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
                }
            }
        });
    };

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setRole('Admin');
        setPassword('');
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className="gestion">
            <h2>Gestión de Usuarios</h2>

            <div className="formulario">
                <form onSubmit={isEditing ? handleUpdateUser : handleAddUser}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                    >
                        <option value="admin">admin</option>
                        <option value="user">user</option>
                    </select>
                    <button type="submit">{isEditing ? 'Actualizar' : 'Agregar'}</button>
                </form>
            </div>

            {isChangingPassword && (
                <div className="change-password-form">
                    <h3>Cambiar Contraseña</h3>
                    <form onSubmit={handleSubmitChangePassword}>
                        <input
                            type="password"
                            placeholder="Nueva Contraseña"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Actualizar Contraseña</button>
                        <button type="button" onClick={() => setIsChangingPassword(false)}>Cancelar</button>
                    </form>
                </div>
            )}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <div className="button-container">
                                    <button className="button edit" onClick={() => handleChangePassword(user.id)}>Cambiar Contraseña</button>
                                    <button className="button delete" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Usuarios;