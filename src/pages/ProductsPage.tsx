
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/data/mockData';
import StarBackground from '@/components/StarBackground';

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceSort, setPriceSort] = useState('');
  
  // Filter and sort products
  const filteredProducts = mockProducts
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (priceSort === 'low-to-high') {
        return a.price - b.price;
      } else if (priceSort === 'high-to-low') {
        return b.price - a.price;
      }
      return 0;
    });
  
  return (
    <>
      <StarBackground />
      
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Nos T-shirts</h1>
          <p className="text-xl text-gray-300 mb-8">
            Trouvez votre style et participez à nos loteries
          </p>
          
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Rechercher un t-shirt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-winshirt-space-light border-winshirt-purple/30 focus:border-winshirt-purple"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Select
              value={priceSort}
              onValueChange={setPriceSort}
            >
              <SelectTrigger className="w-full md:w-[200px] bg-winshirt-space-light border-winshirt-purple/30">
                <SelectValue placeholder="Trier par prix" />
              </SelectTrigger>
              <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                <SelectItem value="">Pertinence</SelectItem>
                <SelectItem value="low-to-high">Prix croissant</SelectItem>
                <SelectItem value="high-to-low">Prix décroissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="mb-8 bg-winshirt-purple/20" />
          
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-xl text-gray-300 mb-4">Aucun produit trouvé</h3>
              <Button 
                onClick={() => setSearchTerm('')}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                Réinitialiser la recherche
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductsPage;
