
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockProducts, mockLotteries } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import StarBackground from '../components/StarBackground';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNavigation from '@/components/admin/AdminNavigation';

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lotteryIdParam = searchParams.get('lottery');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLotteryId, setSelectedLotteryId] = useState<string | null>(lotteryIdParam);
  const [products, setProducts] = useState(mockProducts);
  const [lotteries, setLotteries] = useState(mockLotteries);
  
  // Set the selected lottery ID from URL parameters
  useEffect(() => {
    if (lotteryIdParam) {
      setSelectedLotteryId(lotteryIdParam);
    }
  }, [lotteryIdParam]);
  
  // Charger les produits et loteries depuis localStorage
  useEffect(() => {
    const loadData = () => {
      // Chargement des produits
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setProducts(parsedProducts);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error);
        }
      }
      
      // Chargement des loteries
      const savedLotteries = localStorage.getItem('lotteries');
      if (savedLotteries) {
        try {
          const parsedLotteries = JSON.parse(savedLotteries);
          if (Array.isArray(parsedLotteries) && parsedLotteries.length > 0) {
            setLotteries(parsedLotteries);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des loteries:", error);
        }
      }
    };
    
    loadData();
    
    // Écouter les changements d'URL
    window.addEventListener('popstate', loadData);
    
    return () => {
      window.removeEventListener('popstate', loadData);
    };
  }, []);
  
  // Get the lottery details if a lottery ID is selected
  const selectedLottery = selectedLotteryId 
    ? lotteries.find(lottery => lottery.id.toString() === selectedLotteryId)
    : null;
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || (product.type || '') === selectedType;
    
    // Filter by lottery if a lottery ID is selected
    const matchesLottery = !selectedLotteryId || 
      (product.linkedLotteries && product.linkedLotteries.includes(Number(selectedLotteryId)));
    
    return matchesSearch && matchesType && matchesLottery;
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
          
          {/* Lottery filter info */}
          {selectedLottery && (
            <div className="mb-6 text-center">
              <p className="text-winshirt-blue-light text-xl">
                Produits associés à la loterie: <span className="font-semibold">{selectedLottery.title}</span>
              </p>
            </div>
          )}
          
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
                    <SelectItem value="all">Tous les types</SelectItem>
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
