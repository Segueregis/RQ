import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRequisitions } from '../contexts/RequisitionContext';
import Layout from '../components/Layout';

const Klasmat: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const { klasmatItems, createKlasmatItem, approveKlasmatItem } = useRequisitions();
  const [newItem, setNewItem] = useState({ name: '', code: '', category: 'CIVIL' });
  const [isCreating, setIsCreating] = useState(false);

  const categories = ['CIVIL', 'ELETRICA', 'HIDRAULICA', 'SERRALHERIA', 'PINTURA'];

  const handleCreate = async () => {
    await createKlasmatItem(newItem);
    setNewItem({ name: '', code: '', category: 'CIVIL' });
    setIsCreating(false);
  };

  return (
    <Layout>
      <div className="flex">
        {/* Filtros */}
        <aside className="w-1/4 p-4 bg-gray-100">
          <h2 className="text-lg font-bold mb-4">Categorias</h2>
          <ul>
            {categories.map((category) => (
              <li key={category} className="mb-2">
                <button className="text-blue-600 hover:underline">{category}</button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Lista de Itens */}
        <main className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Itens Klasmat</h1>
            {!isAdmin && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Criar Código Klasmat
              </button>
            )}
          </div>

          {isCreating && (
            <div className="mb-4 p-4 border rounded-md bg-white">
              <h2 className="text-lg font-bold mb-2">Novo Item</h2>
              <div className="mb-2">
                <label className="block text-sm font-medium">Nome</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Código Klasmat</label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium">Categoria</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Salvar
              </button>
            </div>
          )}

          <ul>
            {klasmatItems.map((item) => (
              <li key={item.code} className="mb-2 p-4 border rounded-md bg-white">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p>Código: {item.code}</p>
                <p>Categoria: {item.category}</p>
                {isAdmin && (
                  <button
                    onClick={() => approveKlasmatItem(item.code)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Aprovar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </main>
      </div>
    </Layout>
  );
};

export default Klasmat;