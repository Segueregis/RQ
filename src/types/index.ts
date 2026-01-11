export interface User {
  id: string;
  email: string;
  name?: string;
  // O 'role' 'visualizador' foi corrigido para 'viewer' para manter a consistência
  role: 'user' | 'admin' | 'viewer' | 'financeiro';
  ut?: string; // Adicionado como opcional para a página de NF
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  password?: string; // Apenas para criação de usuário
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

export interface KlasmatItem {
  name: string;
  code: string;
  category: 'CIVIL' | 'ELETRICA' | 'HIDRAULICA' | 'SERRALHERIA' | 'PINTURA';
  approved: boolean;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, ut: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  isFinanceiro: boolean;
}
