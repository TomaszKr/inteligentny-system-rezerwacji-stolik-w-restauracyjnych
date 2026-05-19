export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Table {
  id: number;
  capacity: number;
  location: string;
}

export interface Reservation {
  id: number;
  reservationTime: Date | string;
  guests: number;
  status?: string;
  user?: User;
  table?: Table;
}