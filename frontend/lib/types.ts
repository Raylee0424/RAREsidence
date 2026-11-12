export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "ADMIN" | "TENANT";
  unitId?: string | null;
  unit?: Unit | null;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  description?: string | null;
  address: string;
  priceCents: number; // 250000 = $2,500.00
  bedrooms: number;
  bathrooms: number;
  area?: number | null;
  amenities?: string | null; // JSON string or comma-separated
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  photos: UnitPhoto[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    tenants: number;
  };
}

export interface UnitPhoto {
  id: string;
  unitId: string;
  filename: string;
  path: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  unitId: string;
  unit?: {
    id: string;
    name: string;
    address: string;
  };
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  preferredDate: string;
  message?: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
  };
  unitId: string;
  unit?: {
    id: string;
    name: string;
    address: string;
  };
  amountCents: number;
  type: "RENT" | "DEPOSIT" | "UTILITY";
  status: "PENDING" | "SUBMITTED" | "PAID" | "OVERDUE";
  dueDate: string;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The logged-in user, from POST /auth/login or GET /users/me. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "TENANT";
}

// The session token itself is an httpOnly cookie and never reaches this code.
export interface AuthResponse {
  user: SessionUser;
}
