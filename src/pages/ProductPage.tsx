
import React from 'react';
import { useParams } from 'react-router-dom';

const ProductPage = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6 mt-24">
      <h1 className="text-2xl font-bold mb-6">Détails du produit {id}</h1>
      <div className="bg-card rounded-lg p-6 shadow">
        <p className="text-muted-foreground">
          Détails du produit ici...
        </p>
      </div>
    </div>
  );
};

export default ProductPage;
