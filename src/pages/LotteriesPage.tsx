import React, { useState, useEffect } from 'react';
import { getLotteries } from '@/services/lotteryService';
import { ExtendedLottery } from '@/types/lottery';
import StarBackground from '@/components/StarBackground';
import LotteryCard from '@/components/LotteryCard';

const LotteriesPage = () => {
  const [lotteries, setLotteries] = useState<ExtendedLottery[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLotteries = async () => {
      setLoading(true);
      try {
        const lotteries = await getLotteries(true); // Only active lotteries
        setLotteries(lotteries);
      } catch (error) {
        console.error('Error fetching lotteries:', error);
        setErrorMessage('Could not load lotteries');
      } finally {
        setLoading(false);
      }
    };

    fetchLotteries();
  }, []);

  if (loading) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-8 text-center">
          <h1 className="text-2xl text-white">Loading lotteries...</h1>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <StarBackground />
        <div className="pt-32 pb-8 text-center">
          <h1 className="text-2xl text-red-500">{errorMessage}</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <StarBackground />
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-winshirt-purple to-winshirt-blue">
            Active Lotteries
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LotteriesPage;
