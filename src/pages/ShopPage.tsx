
import React from 'react';
import ProductsPage from './ProductsPage';
import StarBackground from '@/components/StarBackground';

const ShopPage = () => {
  return (
    <>
      <StarBackground />
      <div className="pt-24 pb-12">
        <ProductsPage />
      </div>
    </>
  );
};

export default ShopPage;
