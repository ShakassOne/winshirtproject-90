
import React from 'react';

const OrderConfirmationPage = () => {
  return (
    <div className="container mx-auto p-6 mt-24">
      <h1 className="text-2xl font-bold mb-6">Confirmation de commande</h1>
      <div className="bg-card rounded-lg p-6 shadow">
        <p className="text-muted-foreground">
          Votre commande a été confirmée. Merci pour votre achat !
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
