// Import all necessary dependencies
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, CreditCard, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseTables } from '@/types/database.types';
import { Client } from '@/types/client';
import { syncProductsAndLotteries } from '@/lib/linkSynchronizer';

// Define a proper type for the client data directly in the file
type ClientData = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  orderCount?: number;
  totalSpent?: number;
  participatedLotteries?: number[];
  wonLotteries?: number[];
};

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost] = useState(5.99);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Synchroniser les liens entre produits et loteries au chargement de la page
    syncProductsAndLotteries();
    
    const fetchClientData = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', 'your-user-id') // Replace 'your-user-id' with the actual user ID
        .single();

      if (error) {
        console.error('Error fetching client data:', error);
        return;
      }

      if (data) {
        const client = handleClientData(data);
        console.log('Client data:', client);
      }
    };

    const loadCart = () => {
      try {
        const cartString = localStorage.getItem('cart');
        if (cartString) {
          const cart = JSON.parse(cartString);
          setCartItems(cart);
          
          // Calculate subtotal
          const calculatedSubtotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
          setSubtotal(calculatedSubtotal);
          setTotal(calculatedSubtotal + shippingCost);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Error loading your cart');
      }
    };

    fetchClientData();
    loadCart();
  }, [shippingCost]);

  const handleClientData = (data: DatabaseTables['clients']): Client => {
    // Cast to our extended type which includes the optional fields
    const extendedData = data as any;
    
    return {
      id: extendedData.id,
      name: extendedData.name || '',
      email: extendedData.email || '',
      phone: extendedData.phone || '',
      address: extendedData.address ? String(extendedData.address) : '',
      registrationDate: extendedData.created_at || new Date().toISOString(),
      orderCount: extendedData.orderCount || 0,
      totalSpent: extendedData.totalSpent || 0,
      participatedLotteries: extendedData.participatedLotteries || [],
      wonLotteries: extendedData.wonLotteries || []
    };
  };

  const handleRemoveItem = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Recalculate totals
    const newSubtotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shippingCost);
    
    toast.info('Item removed from cart');
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newCart = [...cartItems];
    newCart[index].quantity = newQuantity;
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    // Recalculate totals
    const newSubtotal = newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + shippingCost);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
        <ShoppingCart className="mr-2" /> Your Cart
      </h1>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
              <h2 className="text-xl font-semibold text-white mb-4">Items in Cart</h2>
              
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 py-4 border-b border-winshirt-blue/10 last:border-0">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                    <img
                      src={item.image || "https://placehold.co/100x100/png"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.size && `Size: ${item.size}`}
                      {item.color && item.size && ' | '}
                      {item.color && `Color: ${item.color}`}
                    </p>
                    {item.lotteryName && (
                      <p className="text-sm text-winshirt-purple-light">Lottery: {item.lotteryName}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-winshirt-blue/30 rounded-l hover:bg-winshirt-blue/10"
                      >
                        -
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center border-t border-b border-winshirt-blue/30">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-winshirt-blue/30 rounded-r hover:bg-winshirt-blue/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-white">{(item.price * item.quantity).toFixed(2)} €</p>
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      className="mt-2 text-xs text-winshirt-purple-light hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <Card className="p-6 bg-winshirt-space border border-winshirt-purple/20 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{subtotal.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">{shippingCost.toFixed(2)} €</span>
                </div>
                
                <Separator className="bg-winshirt-blue/20" />
                
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-winshirt-purple-light">{total.toFixed(2)} €</span>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark flex items-center justify-center"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
                  <Truck className="mr-1 h-3 w-3" />
                  <span>Free shipping on orders over 50€</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6 bg-winshirt-space border border-winshirt-blue/20">
          <div className="text-center py-8">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-xl font-semibold text-white">Your cart is empty</h2>
            <p className="mt-1 text-gray-400">Looks like you haven't added any products to your cart yet.</p>
            <Button
              onClick={() => navigate('/products')}
              className="mt-4 bg-winshirt-purple hover:bg-winshirt-purple-dark"
            >
              Browse Products
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CartPage;
