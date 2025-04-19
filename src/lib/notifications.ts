
import { toast } from '@/lib/toast';

// Types d'actions pour les messages
type ActionType = 'create' | 'update' | 'delete' | 'sync' | 'error' | 'info' | 'success' | 'warning';
type EntityType = 'lottery' | 'product' | 'visual' | 'participant' | 'winner' | 'order' | 'client' | 'supabase' | 'system' | 'form';
type StorageType = 'local' | 'supabase' | 'both' | 'unknown';

export const showNotification = (
  action: ActionType,
  entity: EntityType,
  success: boolean = true,
  errorMessage?: string,
  details?: any,
  storageType: StorageType = 'unknown'
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
  
  const storageMessages: Record<StorageType, string> = {
    local: '(stockage local)',
    supabase: '(stockage Supabase)',
    both: '(stockage local et Supabase)',
    unknown: ''
  };

  const entityName = entityNames[entity];
  const actionMessage = actionMessages[action];
  const storageMessage = storageMessages[storageType];

  // Log pour le débogage
  console.log(`[${action}] [${entity}] [${storageType}] success: ${success}`, errorMessage || '', details || '');

  if (success) {
    toast.success(`${actionMessage} ${entityName} réussie ${storageMessage}`);
  } else {
    const message = errorMessage 
      ? `${actionMessage} ${entityName} échouée: ${errorMessage} ${storageMessage}`
      : `${actionMessage} ${entityName} échouée ${storageMessage}`;
    toast.error(message);
  }
};

// Notifications spécifiques pour la synchronisation
export const showSyncNotification = (
  tableName: string, 
  success: boolean, 
  total?: number,
  storageType: StorageType = 'supabase'
) => {
  const storageMessages: Record<StorageType, string> = {
    local: '(stockage local)',
    supabase: '(stockage Supabase)',
    both: '(stockage local et Supabase)',
    unknown: ''
  };

  const storageMessage = storageMessages[storageType];

  if (success) {
    if (total !== undefined) {
      toast.success(`Synchronisation de ${tableName} réussie (${total} éléments) ${storageMessage}`);
    } else {
      toast.success(`Synchronisation de ${tableName} réussie ${storageMessage}`);
    }
  } else {
    toast.error(`Échec de la synchronisation de ${tableName} ${storageMessage}`);
  }
  
  // Log pour le débogage
  console.log(`[Sync] [${tableName}] [${storageType}] success: ${success}`, total !== undefined ? `items: ${total}` : '');
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

// Nouvelle fonction pour afficher le statut du stockage
export const showStorageStatusNotification = (
  entity: EntityType,
  localData: boolean,
  supabaseData: boolean
) => {
  const entityNames: Record<EntityType, string> = {
    lottery: 'Loteries',
    product: 'Produits',
    visual: 'Visuels',
    participant: 'Participants',
    winner: 'Gagnants',
    order: 'Commandes',
    client: 'Clients',
    supabase: 'Base de données',
    system: 'Système',
    form: 'Formulaire'
  };
  
  const entityName = entityNames[entity];
  
  if (localData && supabaseData) {
    toast.info(`${entityName}: Données présentes en local et sur Supabase`);
  } else if (localData) {
    toast.warning(`${entityName}: Données présentes uniquement en local`);
  } else if (supabaseData) {
    toast.success(`${entityName}: Données présentes uniquement sur Supabase`);
  } else {
    toast.error(`${entityName}: Aucune donnée trouvée`);
  }
  
  // Log pour le débogage
  console.log(`[Storage Status] [${entity}] local: ${localData}, supabase: ${supabaseData}`);
};

// Nouvelle fonction pour afficher le statut de l'administration
export const showAdminAction = (
  entity: EntityType,
  action: string,
  storageType: StorageType = 'unknown'
) => {
  const entityNames: Record<EntityType, string> = {
    lottery: 'loterie',
    product: 'produit',
    visual: 'visuel',
    participant: 'participant',
    winner: 'gagnant',
    order: 'commande',
    client: 'client',
    supabase: 'base de données',
    system: 'système',
    form: 'formulaire'
  };
  
  const storageMessages: Record<StorageType, string> = {
    local: '(stockage local)',
    supabase: '(stockage Supabase)',
    both: '(stockage local et Supabase)',
    unknown: ''
  };
  
  const entityName = entityNames[entity];
  const storageMessage = storageMessages[storageType];
  
  toast.info(`Admin: ${action} ${entityName} ${storageMessage}`);
  
  // Log pour le débogage
  console.log(`[Admin] [${entity}] action: ${action}, storage: ${storageType}`);
};
