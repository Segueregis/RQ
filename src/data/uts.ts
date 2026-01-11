export interface UT {
  id: string;        // identificador único (chave técnica)
  codigo: string;    // código operacional (pode repetir)
  cidade: string;    // cidade da UT
  descricao: string; // descrição para exibição
}

export const utsList: UT[] = [
  // ===============================
  // São José dos Campos
  // ===============================
  {
    id: '020-johnson-projetos-sjc',
    codigo: '020',
    cidade: 'São José dos Campos',
    descricao: '020 - JOHNSON/ KENVUE – PROJETOS - SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '012-johnson-utilidades-sjc',
    codigo: '012',
    cidade: 'São José dos Campos',
    descricao: '012 - JOHNSON/ KENVUE – UTILIDADES - SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '026-johnson-manutencao-sjc',
    codigo: '026',
    cidade: 'São José dos Campos',
    descricao: '026 - JOHNSON/ KENVUE – MANUTENÇÃO - SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '031-johnson-limpeza-sjc',
    codigo: '031',
    cidade: 'São José dos Campos',
    descricao: '031 - JOHNSON/ KENVUE – LIMPEZA - SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '009-gerdau-servicos-sjc',
    codigo: '009',
    cidade: 'São José dos Campos',
    descricao: '009 - GERDAU – SERVIÇOS - SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '017-gerdau-manpred-sjc',
    codigo: '017',
    cidade: 'São José dos Campos',
    descricao: '017 - GERDAU – MAN.PRED-MF-SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '007-eaton-manpred-sjc',
    codigo: '007',
    cidade: 'São José dos Campos',
    descricao: '007 - EATON – MAN.PRED-MF-SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '000-panasonic-manpred-sjc',
    codigo: '000',
    cidade: 'São José dos Campos',
    descricao: '000 - PANASONIC – MAN.PRED-MF-SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '014-johnson-usinagem-sjc',
    codigo: '014',
    cidade: 'São José dos Campos',
    descricao: '014 - JOHNSON/ KENVUE – USINAGEM-MF-SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '032-johnson-almox-sjc',
    codigo: '032',
    cidade: 'São José dos Campos',
    descricao: '032 - JOHNSON/ KENVUE – GESTÃO ALMOX-MF-SÃO JOSÉ DOS CAMPOS'
  },
  {
    id: '000-becooper-manpred-sjc',
    codigo: '000',
    cidade: 'São José dos Campos',
    descricao: '000 - BECOOPER – MAN.PRED-MF-SÃO JOSÉ DOS CAMPOS'
  },

  // ===============================
  // Guarulhos
  // ===============================
  {
    id: '034-johnson-guarulhos',
    codigo: '034',
    cidade: 'Guarulhos',
    descricao: '034 - JOHNSON & JOHNSON – MF-GUARULHOS'
  },
  {
    id: '000-cummins-limpred-ms-guarulhos',
    codigo: '000',
    cidade: 'Guarulhos',
    descricao: '000 - CUMMINS – LIMP.PRED-MS-GUARULHOS'
  },
  {
    id: '001-cummins-manpred-mf-guarulhos',
    codigo: '001',
    cidade: 'Guarulhos',
    descricao: '001 - CUMMINS – MAN.PRED-MF-GUARULHOS'
  },
  {
    id: '003-cummins-limpred-ms-guarulhos',
    codigo: '003',
    cidade: 'Guarulhos',
    descricao: '003 - CUMMINS – LIMP.PRED-MS-GUARULHOS'
  },
  {
    id: '004-cummins-manpred-mf-guarulhos',
    codigo: '004',
    cidade: 'Guarulhos',
    descricao: '004 - CUMMINS – MAN.PRED-MF-GUARULHOS'
  },

  // ===============================
  // Jacareí
  // ===============================
  {
    id: '044-dow-man-equip-jacarei',
    codigo: '044',
    cidade: 'Jacareí',
    descricao: '044 - DOW AGROSC – MAN.EQUIP-MF-JACAREÍ'
  },
  {
    id: '002-ardagh-manpred-jacarei',
    codigo: '002',
    cidade: 'Jacareí',
    descricao: '002 - ARDAGH – MAN.PRED-MF-JACAREÍ'
  },
  {
    id: '003-ardagh-limpred-jacarei',
    codigo: '003',
    cidade: 'Jacareí',
    descricao: '003 - ARDAGH – LIMP.PRED-MS-JACAREÍ'
  },
  {
    id: '010-suzano-limpcons-jacarei',
    codigo: '010',
    cidade: 'Jacareí',
    descricao: '010 - SUZANO – LIMP.CONS.AV-MS-JACAREÍ'
  },

  // ===============================
  // Osasco
  // ===============================
  {
    id: '002-sbt-osasco',
    codigo: '002',
    cidade: 'Osasco',
    descricao: '002 - SBT – MF-OSASCO'
  },
  {
    id: '003-sbt-osasco',
    codigo: '003',
    cidade: 'Osasco',
    descricao: '003 - SBT – MF-OSASCO'
  },

  // ===============================
  // Cruzeiro
  // ===============================
  {
    id: '001-amsted-cruzeiro',
    codigo: '001',
    cidade: 'Cruzeiro',
    descricao: '001 - AMSTED MAXION – SERVIÇOS-CRUZEIRO'
  },

  // ===============================
  // Taubaté
  // ===============================
  {
    id: '000-schlumberger-manpred-taubate',
    codigo: '000',
    cidade: 'Taubaté',
    descricao: '000 - SCHLUMBERGER – MAN.PRED-MF-TAUBATÉ'
  },
  {
    id: '010-schlumberger-limpred-taubate',
    codigo: '010',
    cidade: 'Taubaté',
    descricao: '010 - SCHLUMBERGER – LIMP.PRED-MS-TAUBATÉ'
  },
  {
    id: '000-schlumberger-bombeiros-taubate',
    codigo: '000',
    cidade: 'Taubaté',
    descricao: '000 - SCHLUMBERGER – BOMBEIROS-MS-TAUBATÉ'
  },

  // ===============================
  // Guaratinguetá
  // ===============================
  {
    id: '006-aeroquip-guaratingueta',
    codigo: '006',
    cidade: 'Guaratinguetá',
    descricao: '006 - AEROQUIP DO BRASIL – MF-GUARATINGUETA'
  },

  // ===============================
  // Campo Grande
  // ===============================
  {
    id: '009-cummins-campo-grande',
    codigo: '009',
    cidade: 'Campo Grande',
    descricao: '009 - CUMMINS – FULL SERV-MF-CAMPO GRANDE'
  },

  // ===============================
  // Cuiabá
  // ===============================
  {
    id: '010-cummins-cuiaba',
    codigo: '010',
    cidade: 'Cuiabá',
    descricao: '010 - CUMMINS – FULL SERV-MF-CUIABÁ'
  },

  // ===============================
  // Franco da Rocha
  // ===============================
  {
    id: '043-dow-franco-rocha',
    codigo: '043',
    cidade: 'Franco da Rocha',
    descricao: '043 - DOW AGROSC – MAN.EQUIP-MF-FRANCO DA ROCHA'
  },

  // ===============================
  // Extrema
  // ===============================
  {
    id: '001-panasonic-extrema',
    codigo: '001',
    cidade: 'Extrema',
    descricao: '001 - PANASONIC – MAN.PRED-MF-EXTREMA'
  },

  // ===============================
  // Guararema
  // ===============================
  {
    id: '000-masterfoods-limpcons-guararema',
    codigo: '000',
    cidade: 'Guararema',
    descricao: '000 - MASTERFOODS – LIMP.CONS.AV-MS-GUARAREMA'
  },
  {
    id: '001-masterfoods-manpred-guararema',
    codigo: '001',
    cidade: 'Guararema',
    descricao: '001 - MASTERFOODS – MAN.PRED-MF-GUARAREMA'
  }
];