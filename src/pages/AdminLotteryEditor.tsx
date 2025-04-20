
import React from 'react';
import { useParams } from 'react-router-dom';

const AdminLotteryEditor: React.FC = () => {
  const { id } = useParams();
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Éditeur de loterie</h1>
      <p>ID de la loterie: {id}</p>
      <div className="p-4 bg-winshirt-space/60 border border-winshirt-purple/30 rounded-md">
        <p>Composant en cours d'implémentation.</p>
      </div>
    </div>
  );
};

export default AdminLotteryEditor;
