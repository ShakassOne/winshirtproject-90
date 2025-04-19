
import { toast } from '@/lib/toast';

// Types d'actions pour les messages
type ActionType = 'create' | 'update' | 'delete' | 'sync' | 'error' | 'info';
type EntityType = 'lottery' | 'product' | 'visual' | 'participant' | 'winner' | 'order' | 'client';

export const showNotification = (
  action: ActionType,
  entity: EntityType,
  success: boolean = true,
  errorMessage?: string
) => {
  const entityNames: Record<EntityType, string> = {
    lottery: 'la loterie',
    product: 'le produit',
    visual: 'le visuel',
    participant: 'le participant',
    winner: 'le gagnant',
    order: 'la commande',
    client: 'le client'
  };

  const actionMessages: Record<ActionType, string> = {
    create: 'Création de',
    update: 'Modification de',
    delete: 'Suppression de',
    sync: 'Synchronisation de',
    error: 'Erreur avec',
    info: 'Information sur'
  };

  const entityName = entityNames[entity];
  const actionMessage = actionMessages[action];

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
};

