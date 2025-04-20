
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { toast } from '@/lib/toast';
import StarBackground from '@/components/StarBackground';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  secondaryImage?: string;
  tickets: number;
  selectedLotteries: { id: number; name: string }[];
  visualDesign?: {
    visualId: number;
    visualName: string;
    visualImage: string;
    settings: any;
    printAreaId: number | null;
  } | null;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  
  // Charger les items du panier depuis localStorage
  useEffect(() => {
    const loadCart = () => {
      setLoading(true);
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error('Erreur lors du chargement du panier:', error);
          toast.error('Erreur lors du chargement du panier');
        }
      }
      setLoading(false);
    };
    
    loadCart();
  }, []);
  
  // Calculer le sous-total
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Frais de livraison estimés (à remplacer par une logique réelle)
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  
  // Total avec la livraison
  const total = subtotal + shipping;

  // Gérer la suppression d'un article
  const handleRemoveItem = (itemId: number) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Article supprimé du panier');
  };

  // Gérer la mise à jour de la quantité
  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  
  // Gérer l'application d'un code promo
  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast.error('Veuillez entrer un code promo');
      return;
    }
    
    // Ici vous pourriez vérifier le code promo auprès de votre backend
    toast.error('Code promo invalide ou expiré');
  };
  
  // Passer à la page de paiement
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    
    navigate('/checkout');
  };

  return (
    <>
      <StarBackground />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">Votre Panier</h1>
          
          {loading ? (
            <div className="winshirt-card p-8 text-center">
              <p>Chargement de votre panier...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="winshirt-card p-8">
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Votre panier est vide</h2>
                <p className="text-gray-400 mb-6">Explorez nos produits pour découvrir des articles uniques et participer à nos loteries.</p>
                <Button 
                  onClick={() => navigate('/products')}
                  className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
                >
                  Découvrir nos produits
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Panier */}
              <div className="lg:col-span-2">
                <Card className="winshirt-card overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Articles dans votre panier</h2>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produit</TableHead>
                            <TableHead>Détails</TableHead>
                            <TableHead className="text-right">Prix unitaire</TableHead>
                            <TableHead className="text-center">Quantité</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cartItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="w-20 h-20 relative overflow-hidden rounded">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <h3 className="font-medium text-white">{item.name}</h3>
                                  <div className="text-sm text-gray-400 mt-1">
                                    <p>Taille: {item.size}</p>
                                    <p>Couleur: {item.color}</p>
                                    {item.selectedLotteries && item.selectedLotteries.length > 0 && (
                                      <p>Loteries: {item.selectedLotteries.map(l => l.name).join(', ')}</p>
                                    )}
                                    {item.visualDesign && (
                                      <p>Visuel: {item.visualDesign.visualName}</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.price.toFixed(2)} €
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center">
                                  <button 
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  >
                                    -
                                  </button>
                                  <span className="mx-2">{item.quantity}</span>
                                  <button 
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {(item.price * item.quantity).toFixed(2)} €
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-transparent p-0"
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Résumé de commande */}
              <div>
                <Card className="winshirt-card">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Récapitulatif</h2>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sous-total</span>
                        <span className="text-white">{subtotal.toFixed(2)} €</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Livraison estimée</span>
                        <span className="text-white">{shipping.toFixed(2)} €</span>
                      </div>
                      
                      <Separator className="my-4 bg-winshirt-purple/20" />
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-white">Total</span>
                        <span className="font-bold text-winshirt-purple-light text-xl">{total.toFixed(2)} €</span>
                      </div>
                      
                      <div className="pt-4">
                        <div className="flex gap-2 mb-4">
                          <Input
                            placeholder="Code promo"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="bg-winshirt-space-light border-winshirt-purple/30"
                          />
                          <Button
                            variant="outline"
                            onClick={handleApplyCoupon}
                            className="border-winshirt-purple text-winshirt-purple-light hover:bg-winshirt-purple/20"
                          >
                            Appliquer
                          </Button>
                        </div>
                        
                        <Button
                          onClick={handleCheckout}
                          className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark"
                          disabled={cartItems.length === 0}
                        >
                          Passer au paiement
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          className="w-full mt-2 text-gray-400 hover:text-white"
                          onClick={() => navigate('/products')}
                        >
                          Continuer mes achats
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CartPage;
