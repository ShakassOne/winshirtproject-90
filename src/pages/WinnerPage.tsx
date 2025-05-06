
import React from 'react';
import { useParams } from 'react-router-dom';

const WinnerPage = () => {
  const { lotteryId } = useParams();
  
  return (
    <div className="container mx-auto p-6 mt-24">
      <h1 className="text-2xl font-bold mb-6">Gagnant de la loterie {lotteryId}</h1>
      <div className="bg-card rounded-lg p-6 shadow">
        <p className="text-muted-foreground">
          Informations sur le gagnant de cette loterie...
        </p>
      </div>
    </div>
  );
};

export default WinnerPage;
