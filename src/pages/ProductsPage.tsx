
import React, { useState } from 'react';
import { mockProducts } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import StarBackground from '../components/StarBackground';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNavigation from '@/components/admin/AdminNavigation';

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || (product.type || '') === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  const productTypes = ['entrée de gamme', 'standard', 'premium'];
  
  return (
    <>
      <StarBackground />
      
      {/* Admin Navigation */}
      <AdminNavigation />
      
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Nos Produits
          </h1>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Découvrez notre collection de vêtements tendance qui vous permettent de participer à nos loteries exclusives.
          </p>
          
          {/* Filters */}
          <div className="winshirt-card p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Rechercher</label>
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-2">Filtrer par type</label>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                    <SelectItem value="">Tous les types</SelectItem>
                    {productTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl text-gray-400 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500">Veuillez modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
