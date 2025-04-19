
import { toast } from '@/lib/toast';

// Types d'actions pour les messages
type ActionType = 'create' | 'update' | 'delete' | 'sync' | 'error' | 'info' | 'success' | 'warning';
type EntityType = 'lottery' | 'product' | 'visual' | 'participant' | 'winner' | 'order' | 'client' | 'supabase' | 'system' | 'form';

export const showNotification = (
  action: ActionType,
  entity: EntityType,
  success: boolean = true,
  errorMessage?: string,
  details?: any
) => {
  const entityNames: Record<EntityType, string> = {
    lottery: 'la loterie',
    product: 'le produit',
    visual: 'le visuel',
    participant: 'le participant',
    winner: 'le gagnant',
    order: 'la commande',
    client: 'le client',
    supabase: 'la base de données',
    system: 'le système',
    form: 'le formulaire'
  };

  const actionMessages: Record<ActionType, string> = {
    create: 'Création de',
    update: 'Modification de',
    delete: 'Suppression de',
    sync: 'Synchronisation de',
    error: 'Erreur avec',
    info: 'Information sur',
    success: 'Succès avec',
    warning: 'Attention avec'
  };

  const entityName = entityNames[entity];
  const actionMessage = actionMessages[action];

  // Log pour le débogage
  console.log(`[${action}] [${entity}] success: ${success}`, errorMessage || '', details || '');

  if (success) {
    toast.success(`${actionMessage} ${entityName} réussie`);
  } else {
    const message = errorMessage 
      ? `${actionMessage} ${entityName} échouée: ${errorMessage}`
      : `${actionMessage} ${entityName} échouée`;
    toast.error(message);
  }
};

// Notifications spécifiques pour la synchronisation
export const showSyncNotification = (
  tableName: string, 
  success: boolean, 
  total?: number
) => {
  if (success) {
    if (total !== undefined) {
      toast.success(`Synchronisation de ${tableName} réussie (${total} éléments)`);
    } else {
      toast.success(`Synchronisation de ${tableName} réussie`);
    }
  } else {
    toast.error(`Échec de la synchronisation de ${tableName}`);
  }
  
  // Log pour le débogage
  console.log(`[Sync] [${tableName}] success: ${success}`, total !== undefined ? `items: ${total}` : '');
};

// Notifications pour les erreurs de connexion
export const showConnectionNotification = (
  connected: boolean,
  error?: string
) => {
  if (connected) {
    toast.success("Connexion à Supabase établie");
  } else {
    const message = error 
      ? `Connexion à Supabase impossible: ${error}`
      : "Connexion à Supabase impossible";
    toast.error(message);
  }
  
  // Log pour le débogage
  console.log(`[Connection] status: ${connected ? 'connected' : 'disconnected'}`, error || '');
};

// Nouvelle fonction pour afficher les détails techniques pour les erreurs
export const showTechnicalError = (
  errorType: string,
  message: string,
  details?: any
) => {
  toast.error(`Erreur technique (${errorType}): ${message}`);
  
  // Log détaillé pour le débogage
  console.error(`[Technical Error] [${errorType}]`, message, details || '');
  
  // Afficher les détails dans la console pour le débogage
  if (details) {
    console.error('Détails techniques:', details);
  }
};

// Nouvelle fonction pour les retours d'information de formulaire
export const showFormValidation = (
  field: string,
  message: string,
  isError: boolean = true
) => {
  if (isError) {
    toast.error(`Validation: ${field} - ${message}`);
  } else {
    toast.success(`${field} valide`);
  }
  
  // Log pour le débogage
  console.log(`[FormValidation] [${field}] ${isError ? 'error' : 'success'}:`, message);
};
