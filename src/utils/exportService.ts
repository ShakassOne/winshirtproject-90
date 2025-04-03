
import { ExtendedProduct } from '@/types/product';
import { ExtendedLottery, Participant } from '@/types/lottery';
import { toast } from '@/lib/toast';

interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  filename?: string;
}

// Fonction générique pour exporter des données
export const exportData = <T>(data: T[], options: ExportOptions): boolean => {
  try {
    switch (options.format) {
      case 'csv':
        return exportToCSV(data, options.filename);
      case 'json':
        return exportToJSON(data, options.filename);
      case 'excel':
        // Pour Excel, on exporte en CSV et on compte sur Excel pour l'ouvrir correctement
        return exportToCSV(data, options.filename);
      default:
        throw new Error(`Format d'export non pris en charge: ${options.format}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'exportation:", error);
    toast.error(`Erreur lors de l'exportation: ${(error as Error).message}`);
    return false;
  }
};

// Exporter en CSV
const exportToCSV = <T>(data: T[], filename?: string): boolean => {
  if (!data || data.length === 0) {
    toast.error("Aucune donnée à exporter");
    return false;
  }

  // En-têtes CSV basés sur les clés du premier élément
  const headers = Object.keys(data[0]);
  
  // Fonction pour échapper les valeurs CSV
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    const str = String(value);
    // Si la valeur contient des virgules, des guillemets ou des sauts de ligne, l'entourer de guillemets
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      // Remplacer les guillemets par des doubles guillemets (convention CSV)
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  
  // Fonction pour aplatir des objets imbriqués
  const flattenObject = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, k: string) => {
      const pre = prefix.length ? `${prefix}_` : '';
      
      // Si c'est un tableau ou un objet imbriqué, le convertir en string
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        if (Array.isArray(obj[k])) {
          acc[`${pre}${k}`] = JSON.stringify(obj[k]);
        } else {
          const flatObj = flattenObject(obj[k], `${pre}${k}`);
          Object.assign(acc, flatObj);
        }
      } else {
        acc[`${pre}${k}`] = obj[k];
      }
      return acc;
    }, {});
  };
  
  // Aplatir toutes les données
  const flatData = data.map(item => flattenObject(item));
  
  // Recalculer les en-têtes après aplatissement
  const flatHeaders = Object.keys(flatData[0]);
  
  // Générer les lignes CSV
  let csvContent = flatHeaders.join(',') + '\n';
  
  flatData.forEach(item => {
    const row = flatHeaders.map(header => {
      // Accéder à la propriété via header
      return escapeCSV(item[header]);
    }).join(',');
    csvContent += row + '\n';
  });
  
  // Créer un Blob et un lien de téléchargement
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename || 'export'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success("Exportation CSV réussie");
  return true;
};

// Exporter en JSON
const exportToJSON = <T>(data: T[], filename?: string): boolean => {
  if (!data || data.length === 0) {
    toast.error("Aucune donnée à exporter");
    return false;
  }
  
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename || 'export'}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success("Exportation JSON réussie");
  return true;
};

// Fonctions spécifiques pour différents types de données
export const exportProducts = (products: ExtendedProduct[], options: ExportOptions): boolean => {
  return exportData(products, {
    ...options,
    filename: options.filename || `produits_${new Date().toISOString().slice(0, 10)}`
  });
};

export const exportLotteries = (lotteries: ExtendedLottery[], options: ExportOptions): boolean => {
  return exportData(lotteries, {
    ...options,
    filename: options.filename || `loteries_${new Date().toISOString().slice(0, 10)}`
  });
};

export const exportParticipations = (participations: any[], options: ExportOptions): boolean => {
  return exportData(participations, {
    ...options,
    filename: options.filename || `participations_${new Date().toISOString().slice(0, 10)}`
  });
};

export const exportClients = (clients: any[], options: ExportOptions): boolean => {
  return exportData(clients, {
    ...options,
    filename: options.filename || `clients_${new Date().toISOString().slice(0, 10)}`
  });
};

export const exportCommandes = (commandes: any[], options: ExportOptions): boolean => {
  return exportData(commandes, {
    ...options,
    filename: options.filename || `commandes_${new Date().toISOString().slice(0, 10)}`
  });
};
