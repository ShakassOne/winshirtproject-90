
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { toast } from '@/lib/toast';
import React from 'react';

/**
 * Hook to fetch orders data
 */
export const useOrders = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transform data structure if needed
        const formattedOrders = data.map(order => ({
          ...order,
          items: order.order_items || []
        })) as Order[];
        
        setOrders(formattedOrders);
        
        // Store in localStorage as fallback
        localStorage.setItem('orders', JSON.stringify(formattedOrders));
      } else {
        // Fallback to localStorage
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        } else {
          // If no data in localStorage, use empty array
          setOrders([]);
        }
      }
      return true;
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Fallback to localStorage on error
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch (e) {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, refreshOrders: fetchOrders };
};

/**
 * Synchronizes orders data with Supabase
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating success or failure
 */
export const syncOrdersToSupabase = async (): Promise<boolean> => {
  try {
    // Fetch orders from localStorage
    const storedOrders = localStorage.getItem('orders');
    if (!storedOrders) {
      console.error('No local orders found to sync');
      return false;
    }
    
    const localOrders: Order[] = JSON.parse(storedOrders);

    // Process each order
    for (const order of localOrders) {
      // Prepare order data for Supabase format
      const orderData = {
        id: order.id,
        user_id: order.userId || null,
        client_name: order.clientName,
        client_email: order.clientEmail,
        status: order.status,
        total: order.total,
        subtotal: order.subtotal || null,
        shipping_info: order.shipping || null,
        payment_info: order.payment || null,
        delivery_info: order.delivery || null,
        order_date: order.orderDate,
        created_at: order.created_at || new Date().toISOString(),
        updated_at: order.updated_at || new Date().toISOString(),
        notes: order.notes || null,
        tracking_number: order.tracking_number || null,
        invoice_url: order.invoice_url || null
      };

      // Upsert the order
      const { error: orderError } = await supabase
        .from('orders')
        .upsert(orderData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (orderError) {
        console.error(`Error syncing order ID ${order.id}:`, orderError);
        toast.error(`Erreur lors de la synchronisation de la commande ID ${order.id}: ${orderError.message}`, { position: "bottom-right" });
        continue; // Continue with next order
      }

      // Process order items if they exist
      if (order.items && order.items.length > 0) {
        // Prepare order items for Supabase
        const orderItems = order.items.map(item => ({
          id: item.id,
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productName,
          product_image: item.productImage,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          color: item.color || null,
          customization: item.customization || null,
          visual_design: item.visualDesign || null,
          lotteries_entries: item.lotteriesEntries || [],
          created_at: item.created_at || new Date().toISOString()
        }));

        // Upsert each order item
        for (const item of orderItems) {
          const { error: itemError } = await supabase
            .from('order_items')
            .upsert(item, { 
              onConflict: 'id',
              ignoreDuplicates: false 
            });

          if (itemError) {
            console.error(`Error syncing order item ID ${item.id}:`, itemError);
            // Continue with next item
          }
        }
      }
    }

    toast.success(`Commandes synchronisées avec succès`, { position: "bottom-right" });
    return true;
  } catch (error) {
    console.error('Error syncing orders:', error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};
