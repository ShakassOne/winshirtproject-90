export const getLotteries = async (activeOnly = false) => {
  try {
    // Try to get from localStorage first
    const storedLotteries = localStorage.getItem('lotteries');
    
    if (storedLotteries) {
      const parsedLotteries = JSON.parse(storedLotteries);
      
      // Filter by active status if requested
      if (activeOnly) {
        return parsedLotteries.filter(lottery => lottery.status === 'active');
      }
      
      return parsedLotteries;
    }
    
    // If not in localStorage, return empty array
    return [];
  } catch (error) {
    console.error("Error fetching lotteries:", error);
    throw error;
  }
};

// Export any missing functions
export const useLotteries = () => {
  // Implementation would depend on the existing code
  // This is just a placeholder to fix the missing export
  return {
    lotteries: [],
    loading: false,
    error: null
  };
};

// If getAllLotteries was referenced but not defined, alias it to getLotteries
export const getAllLotteries = getLotteries;
