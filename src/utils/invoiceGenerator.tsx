
import { Order } from '@/types/order';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    padding: 10,
    borderBottom: '1px solid #ddd',
  },
  logo: {
    width: 150,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6B46C1', // couleur purple de WinShirt
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#ddd',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 0,
    borderRightWidth: 1,
    borderColor: '#ddd',
    textAlign: 'left',
    flexGrow: 1,
  },
  productCell: {
    width: '40%',
  },
  quantityCell: {
    width: '15%',
    textAlign: 'center',
  },
  priceCell: {
    width: '20%',
    textAlign: 'right',
  },
  totalCell: {
    width: '25%',
    textAlign: 'right',
  },
  customerInfo: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    marginBottom: 5,
  },
  totals: {
    marginTop: 30,
    textAlign: 'right',
  },
  total: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTop: '1px solid #ddd',
    paddingTop: 10,
    fontSize: 10,
    color: '#666',
  },
});

// Création du document PDF de facture
const InvoiceDocument = ({ order }: { order: Order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>WinShirt - Facture</Text>
        <Text>Facture N°: {order.id}</Text>
        <Text>Date: {new Date(order.orderDate).toLocaleDateString('fr-FR')}</Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.label}>Client:</Text>
        <Text style={styles.value}>{order.clientName}</Text>
        <Text style={styles.value}>{order.clientEmail}</Text>
        
        <Text style={styles.label}>Adresse de livraison:</Text>
        <Text style={styles.value}>{order.shipping.address}</Text>
        <Text style={styles.value}>{order.shipping.postalCode}, {order.shipping.city}</Text>
        <Text style={styles.value}>{order.shipping.country}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.productCell]}>Produit</Text>
          <Text style={[styles.tableCell, styles.quantityCell]}>Quantité</Text>
          <Text style={[styles.tableCell, styles.priceCell]}>Prix unitaire</Text>
          <Text style={[styles.tableCell, styles.totalCell]}>Total</Text>
        </View>

        {order.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.productCell]}>
              {item.productName} 
              {item.size && ` - Taille: ${item.size}`}
              {item.color && ` - Couleur: ${item.color}`}
            </Text>
            <Text style={[styles.tableCell, styles.quantityCell]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.priceCell]}>{item.price.toFixed(2)} €</Text>
            <Text style={[styles.tableCell, styles.totalCell]}>{(item.price * item.quantity).toFixed(2)} €</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <Text>Sous-total: {order.subtotal.toFixed(2)} €</Text>
        <Text>Frais de livraison ({order.shipping.method}): {order.shipping.cost.toFixed(2)} €</Text>
        <Text style={styles.total}>Total: {order.total.toFixed(2)} €</Text>
      </View>

      <View style={styles.section}>
        <Text>Méthode de paiement: {order.payment.method}</Text>
        <Text>Statut du paiement: {
          order.payment.status === 'completed' ? 'Payé' : 
          order.payment.status === 'pending' ? 'En attente' : 'Échoué'
        }</Text>
      </View>

      <View style={styles.footer}>
        <Text>WinShirt - Vêtements à gagner</Text>
        <Text>123 Rue de la Mode, 75001 Paris</Text>
        <Text>SIRET: 123 456 789 00012 - TVA: FR12 123 456 789</Text>
      </View>
    </Page>
  </Document>
);

// Composant pour générer un lien de téléchargement
export const InvoiceDownloadLink = ({ order }: { order: Order }) => (
  <PDFDownloadLink 
    document={<InvoiceDocument order={order} />} 
    fileName={`facture-winshirt-${order.id}.pdf`}
  >
    {({ loading }) => (
      loading ? 'Génération du PDF...' : 'Télécharger la facture'
    )}
  </PDFDownloadLink>
);

// Fonction utilitaire pour afficher la facture dans un nouvel onglet
export const generateInvoiceUrl = (order: Order): string => {
  // Dans une vraie application, cette fonction appellerait une API
  // pour générer le PDF et renvoyer une URL, ou stockerait des PDFs pré-générés
  // Pour cette démo, nous allons utiliser une URL fictive basée sur l'ID de commande
  return `/api/invoices/${order.id}`;
};

// Fonction qui met à jour l'ordre avec une URL de facture (pour simuler le comportement)
export const generateAndStoreInvoiceUrl = (order: Order): Order => {
  // Génère une URL de facture fictive
  const invoiceUrl = `/invoices/order-${order.id}.pdf`;
  
  // Retourne une copie de la commande avec l'URL de la facture
  return {
    ...order,
    invoiceUrl
  };
};
