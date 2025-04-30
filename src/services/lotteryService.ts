
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

// Implement useLotteries hook properly
import { useState, useEffect } from 'react';

export const useLotteries = () => {
  const [lotteries, setLotteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const data = await getLotteries();
        setLotteries(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchLotteries();
  }, []);

  return { lotteries, loading, error };
};

// Export getAllLotteries as an alias to getLotteries
export const getAllLotteries = getLotteries;
