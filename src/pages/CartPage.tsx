
// Import all necessary dependencies
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseTables } from '@/types/database.types';
import { Client } from '@/types/client';
import { syncProductsAndLotteries } from '@/lib/linkSynchronizer';

// Let's define a proper type mapping for the client data
type ExtendedClientData = DatabaseTables['clients'] & {
  orderCount?: number;
  totalSpent?: number;
  participatedLotteries?: number[];
  wonLotteries?: number[];
};

const CartPage: React.FC = () => {
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

    fetchClientData();
  }, []);

  const handleClientData = (data: DatabaseTables['clients']): Client => {
    // Cast to our extended type which includes the optional fields
    const extendedData = data as ExtendedClientData;
    
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

  return (
    <div>
      <h1>Cart Page</h1>
      {/* Display client data here */}
    </div>
  );
};

export default CartPage;
