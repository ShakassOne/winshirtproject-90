
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addLotteryParticipant } from '@/api/lotteryApi';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';

interface LotteryParticipateButtonProps {
  lotteryId: number;
  className?: string;
}

const LotteryParticipateButton: React.FC<LotteryParticipateButtonProps> = ({ lotteryId, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleParticipate = async () => {
    setIsLoading(true);
    
    try {
      // Check if user is logged in
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data?.user) {
        toast.error("Veuillez vous connecter pour participer à cette loterie.");
        return;
      }
      
      const user = data.user;
      
      // Create participant object with userId field
      const participant = {
        userId: user.id ? parseInt(user.id.replace(/-/g, '').substring(0, 8), 16) : Math.floor(Math.random() * 1000000), 
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email?.split('@')[0] || 'User'}`
      };
      
      console.log("Adding participant to lottery:", {lotteryId, participant});
      
      // Add participant to lottery
      const success = await addLotteryParticipant(lotteryId, participant);
      
      if (success) {
        toast.success("Vous participez maintenant à cette loterie !");
        // Refresh the page to show updated participation
        window.location.reload();
      } else {
        toast.error("Erreur lors de l'inscription à la loterie.");
      }
    } catch (error) {
      console.error("Error participating in lottery:", error);
      toast.error("Une erreur est survenue lors de la participation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleParticipate} 
      disabled={isLoading}
      className={`bg-winshirt-blue hover:bg-winshirt-blue-dark ${className}`}
    >
      {isLoading ? "Traitement en cours..." : "Participer à cette loterie"}
    </Button>
  );
};

export default LotteryParticipateButton;
