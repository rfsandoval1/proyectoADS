export interface User {
  id: string;
  name: string;
  email: string;
  role: 'cliente' | 'asistente' | 'gerente';
  cedula?: string;
  telefono?: string;
  direccion?: string;
  createdAt: Date;
  authToken?: string; 
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const USERS_KEY = 'el_granito_users';
const CURRENT_USER_KEY = 'el_granito_current_user';

export const authService = {
  // Registrar cliente
  registerClient: async (userData: {
    name: string;
    email: string;
    password: string;
    cedula?: string;
    telefono?: string;
    direccion?: string;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Verificar si el email ya existe
    if (users.find((user: User) => user.email === userData.email)) {
      return { success: false, message: 'Este correo ya está registrado. Intente iniciar sesión o recuperar su contraseña.' };
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, message: 'El formato del correo electrónico no es válido.' };
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(userData.password)) {
  return { 
    success: false, 
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial. Ejemplo: Cliente123!, MiClave2024@, ContraseñaSegura1$' 
  };
}

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: 'cliente',
      cedula: userData.cedula,
      telefono: userData.telefono,
      direccion: userData.direccion,
      createdAt: new Date()
    };

    users.push({ ...newUser, password: userData.password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return { success: true, message: 'Registro exitoso', user: newUser };
  },

  // Registrar asistente (solo gerente)
  registerAssistant: async (userData: {
    name: string;
    email: string;
    password: string;
  }, currentUser: User): Promise<{ success: boolean; message: string; user?: User }> => {
    if (currentUser.role !== 'gerente') {
      return { success: false, message: 'No tiene permisos para realizar esta acción.' };
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((user: User) => user.email === userData.email)) {
      return { success: false, message: 'El correo ingresado ya está registrado. Intente con otro.' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: 'asistente',
      createdAt: new Date()
    };

    users.push({ ...newUser, password: userData.password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return { success: true, message: 'Asistente registrado exitosamente', user: newUser };
  },

  // Iniciar sesión
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Credenciales incorrectas. Intente nuevamente.' };
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return { success: true, message: 'Inicio de sesión exitoso', user: userWithoutPassword };
  },

  // Obtener usuario actual
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Verificar si está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(CURRENT_USER_KEY);
  },

  // Obtener todos los usuarios (para gestión)
  getAllUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  // Actualizar usuario
  updateUser: async (userId: string, userData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((user: any) => user.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    users[userIndex] = { ...users[userIndex], ...userData };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true, message: 'Usuario actualizado exitosamente' };
  },

  // Eliminar usuario
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const filteredUsers = users.filter((user: any) => user.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    return { success: true, message: 'Usuario eliminado exitosamente' };
  },

  // Resetear contraseña
  resetPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((user: any) => user.email === email);
    
    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Validar fortaleza de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return { 
        success: false, 
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.' 
      };
    }

    users[userIndex].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true, message: 'Contraseña actualizada exitosamente' };
  },

  // Verificar si el email existe
  emailExists: async (email: string): Promise<{ exists: boolean; user?: User }> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { exists: true, user: userWithoutPassword };
    }
    
    return { exists: false };
  }
};

// Crear usuarios por defecto para pruebas
export const initializeDefaultUsers = () => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  // Crear usuarios de prueba si no existen
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: '1',
        name: 'Mauricio Taco',
        email: 'gerente@elgranito.com',
        password: 'Gerente123!',
        role: 'gerente',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Yolanda Tipan',
        email: 'asistente@elgranito.com',
        password: 'Asistente123!',
        role: 'asistente',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'María Perez',
        email: 'cliente@elgranito.com',
        password: 'Cliente123!',
        role: 'cliente',
        cedula: '1234567890',
        telefono: '0999123456',
        direccion: 'Av. Principal 123, Quito',
        createdAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    console.log('Usuarios de prueba creados:', defaultUsers.map(u => ({ email: u.email, password: u.password, role: u.role })));
  }
};