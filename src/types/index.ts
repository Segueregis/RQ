export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'user' | 'admin' | 'visualizador';
  createdAt: string;
}

export interface Requisition {
  id: string;
  rq: string;
  valorTotal: number;
  ut: string;
  descricao: string;
  local: string;
  fornecedor: string;
  status: 'pendente' | 'entregue' | 'em_financeiro';
  notaFiscal?: string;
  oc?: string;
  dataEmissao?: string;
  valorNF?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  dataEnvio?: string;
  usuarioEnvio?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isViewer: boolean;
}