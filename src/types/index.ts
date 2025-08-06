export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Requisition {
  id: string;
  rq: string;
  valorTotal: number;
  numeroOS: string;
  descricao: string;
  local: string;
  fornecedor: string;
  status: 'pendente' | 'entregue';
  notaFiscal?: string;
  oc?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}