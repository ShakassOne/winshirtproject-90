
import { toast } from './toast';

type ActionType = 'sync' | 'update' | 'delete' | 'create';
type EntityType = string;

/**
 * Show notification for an action
 * @param action Action type (sync, update, delete, create)
 * @param entity Entity type (table name or other entity)
 * @param success Whether the action was successful
 * @param error Optional error message
 */
export const showNotification = (
  action: ActionType,
  entity: EntityType,
  success: boolean,
  error?: string
): void => {
  const actionText = {
    sync: 'Synchronisation',
    update: 'Mise à jour',
    delete: 'Suppression',
    create: 'Création'
  };

  const title = `${actionText[action]} ${entity}`;
  const description = success
    ? `${actionText[action]} de ${entity} réussie.`
    : `Échec de ${actionText[action].toLowerCase()} de ${entity}.`;

  if (success) {
    toast.success(description, { position: "bottom-right" });
  } else {
    toast.error(`${description} ${error ? `Erreur: ${error}` : ''}`, { position: "bottom-right" });
  }
};
