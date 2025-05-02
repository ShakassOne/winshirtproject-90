
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">{title} Page</h1>
        <p className="text-gray-400">This page is under construction</p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-purple-700 hover:bg-purple-800"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
