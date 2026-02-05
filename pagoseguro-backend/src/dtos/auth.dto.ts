export interface RegisterRequestDTO {
  email: string;
  password: string;
  fullName: string;
  cedula: string;
  telefono: string;
  direccion: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RecoverPasswordRequestDTO {
  email: string;
}

export interface LogoutRequestDTO {
  refreshToken?: string;
}


export interface UserResponseDTO {
  id: string;
  email: string;
  fullName: string;
  role: string;
  cedula?: string;
}

export interface LoginResponseDTO {
  success: boolean;
  accessToken: string;
  user: UserResponseDTO;
}

export interface RegisterResponseDTO {
  success: boolean;
  userId: string;
  message: string;
}

export interface RecoverPasswordResponseDTO {
  success: boolean;
  message: string;
}

export interface LogoutResponseDTO {
  success: boolean;
  message: string;
}


export interface AuthContextDTO {
  ipAddress: string;
  userAgent: string;
}

export interface LoginServiceDTO extends LoginRequestDTO, AuthContextDTO {}

export interface RegisterServiceDTO extends RegisterRequestDTO, AuthContextDTO {}

export interface RecoverPasswordServiceDTO extends RecoverPasswordRequestDTO, AuthContextDTO {}

export interface LogoutServiceDTO extends AuthContextDTO {
  userId: string;
  refreshToken?: string;
}
