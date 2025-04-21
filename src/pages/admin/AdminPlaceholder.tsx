
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarBackground from '@/components/StarBackground';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminPlaceholder: React.FC = () => {
  return (
    <>
      <StarBackground />
      <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-winshirt-space border border-winshirt-purple/20">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <ShieldAlert size={48} className="text-winshirt-purple" />
            </div>
            <CardTitle className="text-2xl text-center text-white">
              Administration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-gray-300">
              Le panneau d'administration est en cours de développement et sera disponible prochainement.
            </p>
            <Button asChild variant="default" className="w-full bg-winshirt-purple hover:bg-winshirt-purple-dark">
              <Link to="/">
                <ArrowLeft size={16} className="mr-2" /> 
                Retour à l'accueil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminPlaceholder;
