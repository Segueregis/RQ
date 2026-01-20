export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'viewer' | 'financeiro';
  ut?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  password?: string;
}

/**
 * 🔹 Status da Requisição (fluxo novo)
 * pendente → aguardando_lancamento
 * aguardando_lancamento → lancada | abriu_chamado
 * abriu_chamado → lancada
 */
export type RequisitionStatus =
  | 'pendente'
  | 'aguardando_lancamento'
  | 'lancada'
  | 'paga'
  | 'cancelada'
  | 'abriu_chamado';

export interface Requisition {
  id: string;
  rq: string;
  valorTotal: number;
  ut: string;
  descricao: string;
  local: string;
  fornecedor: string;

  status: RequisitionStatus;

  notaFiscal?: string;
  oc?: string;
  dataEmissao?: string;
  valorNF?: number;
  notaFiscalPdfUrl?: string;  // Adicionado

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
  register: (
    name: string,
    email: string,
    password: string,
    ut: string
  ) => Promise<boolean>;

  isAuthenticated: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  isFinanceiro: boolean;
}
