export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

export interface AuthCredentials {
  email: string;
  pin: string;
}

export interface SignUpData {
  name: string;
  email: string;
  age: number;
  pin: string;
  confirmPin: string;
}



export interface SignUpFormErrors {
  name?: string;
  email?: string;
  age?: string;
  pin?: string;
  confirmPin?: string;
}