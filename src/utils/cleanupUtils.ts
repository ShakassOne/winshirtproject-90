/**
 * Utility functions to clean up test data from localStorage
 */

/**
 * Delete all clients from localStorage
 */
export const deleteAllClients = () => {
  try {
    localStorage.setItem('clients', JSON.stringify([]));
    console.log('All clients have been deleted');
    
    // Trigger event to notify components of the update
    window.dispatchEvent(new Event('clientsUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error deleting clients:', error);
    return false;
  }
};

/**
 * Delete all orders from localStorage
 */
export const deleteAllOrders = () => {
  try {
    localStorage.setItem('orders', JSON.stringify([]));
    localStorage.setItem('order_items', JSON.stringify([]));
    console.log('All orders and order items have been deleted');
    
    // Trigger event to notify components of the update
    window.dispatchEvent(new Event('ordersUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error deleting orders:', error);
    return false;
  }
};

/**
 * Reset lottery participant counts
 */
export const resetLotteryParticipants = () => {
  try {
    const lotteries = JSON.parse(localStorage.getItem('lotteries') || '[]');
    
    const resetLotteries = lotteries.map((lottery: any) => ({
      ...lottery,
      currentParticipants: 0,
      current_participants: 0
    }));
    
    localStorage.setItem('lotteries', JSON.stringify(resetLotteries));
    console.log('All lottery participant counts have been reset to 0');
    
    // Trigger event to notify components of the update
    window.dispatchEvent(new Event('lotteriesUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error resetting lottery participants:', error);
    return false;
  }
};

/**
 * Delete all mock winners
 */
export const deleteMockWinners = () => {
  try {
    localStorage.setItem('lottery_winners', JSON.stringify([]));
    console.log('All mock winners have been deleted');
    
    return true;
  } catch (error) {
    console.error('Error deleting mock winners:', error);
    return false;
  }
};

/**
 * Clean up all fake users
 */
export const cleanupFakeUsers = () => {
  try {
    // Keep only the real Supabase users
    const realUserStr = localStorage.getItem('winshirt_user');
    if (realUserStr) {
      const realUser = JSON.parse(realUserStr);
      
      // Clear simulated users
      localStorage.removeItem('user');
      localStorage.removeItem('winshirt_users');
      
      // Only preserve the real authenticated user
      localStorage.setItem('winshirt_users', JSON.stringify([realUser]));
      
      console.log('All fake users have been cleaned up');
    }
    
    // Clean up all client-user associations
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        localStorage.removeItem(key);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error cleaning up fake users:', error);
    return false;
  }
};

/**
 * Clean up all test data
 */
export const cleanupAllTestData = () => {
  deleteAllClients();
  deleteAllOrders();
  resetLotteryParticipants();
  deleteMockWinners();
  cleanupFakeUsers();
  
  console.log('All test data has been cleaned up');
  return true;
};
