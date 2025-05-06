
import React from 'react';
import { useParams } from 'react-router-dom';

const LotteryDetailsPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6 mt-24">
      <h1 className="text-2xl font-bold mb-6">Détails de la loterie {id}</h1>
      <div className="bg-card rounded-lg p-6 shadow">
        <p className="text-muted-foreground">
          Détails de la loterie ici...
        </p>
      </div>
    </div>
  );
};

export default LotteryDetailsPage;
