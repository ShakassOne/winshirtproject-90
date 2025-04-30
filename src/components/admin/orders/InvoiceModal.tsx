
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';
import { FileText, Download } from 'lucide-react';
import { InvoiceDownloadLink } from '@/utils/invoiceGenerator';

export interface InvoiceModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-winshirt-space/30 backdrop-blur-md border border-winshirt-purple/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-winshirt-purple" /> 
            Facture - Commande #{order.id}
          </DialogTitle>
          <DialogDescription>
            Détails de la facture pour la commande passée le {new Date(order.orderDate).toLocaleDateString('fr-FR')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-winshirt-purple-light">Informations client</h3>
              <p className="text-white">{order.clientName}</p>
              <p className="text-gray-300">{order.clientEmail}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-winshirt-purple-light">Adresse de livraison</h3>
              <p className="text-white">{order.shipping.address}</p>
              <p className="text-white">{order.shipping.postalCode}, {order.shipping.city}</p>
              <p className="text-white">{order.shipping.country}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-winshirt-purple-light mb-2">Articles</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-winshirt-space-light text-white">
                  <tr>
                    <th className="py-2 px-4 text-left">Produit</th>
                    <th className="py-2 px-4 text-center">Quantité</th>
                    <th className="py-2 px-4 text-right">Prix unitaire</th>
                    <th className="py-2 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b border-winshirt-purple/10">
                      <td className="py-2 px-4 text-white">
                        {item.productName}
                        {item.size && <span className="text-gray-400 text-sm"> - Taille: {item.size}</span>}
                        {item.color && <span className="text-gray-400 text-sm"> - Couleur: {item.color}</span>}
                      </td>
                      <td className="py-2 px-4 text-center text-white">{item.quantity}</td>
                      <td className="py-2 px-4 text-right text-white">{item.price.toFixed(2)} €</td>
                      <td className="py-2 px-4 text-right text-white">{(item.price * item.quantity).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex flex-col items-end mt-4 space-y-1">
            <p className="text-gray-300">Sous-total: <span className="text-white">{order.subtotal.toFixed(2)} €</span></p>
            <p className="text-gray-300">Frais de livraison ({order.shipping.method}): <span className="text-white">{order.shipping.cost.toFixed(2)} €</span></p>
            <p className="text-winshirt-purple-light font-bold text-lg">Total: {order.total.toFixed(2)} €</p>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button className="flex items-center gap-2 bg-winshirt-purple hover:bg-winshirt-purple-dark">
              <Download size={16} />
              <InvoiceDownloadLink order={order} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
