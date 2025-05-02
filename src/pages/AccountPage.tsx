
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    toast.success("Vous avez été déconnecté avec succès");
    navigate('/');
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="bg-winshirt-space/60 backdrop-blur-lg p-8 rounded-lg border border-winshirt-purple/30">
        <h1 className="text-3xl font-bold mb-8 text-white">Mon Compte</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Nom</p>
                <p className="text-white text-lg">{user?.name || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white text-lg">{user?.email || 'Non renseigné'}</p>
              </div>
              {user?.role === 'admin' && (
                <div>
                  <p className="text-gray-400">Rôle</p>
                  <p className="text-white text-lg bg-winshirt-purple/40 inline-block px-2 py-1 rounded">Administrateur</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-winshirt-purple/30">
            <h2 className="text-xl font-semibold text-white">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/cart')}
                className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
              >
                Mon Panier
              </Button>
              
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
