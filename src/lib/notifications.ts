
import { toast } from './toast';

// Define allowed action types
export type ActionType = 'sync' | 'update' | 'delete' | 'create' | 'success' | 'error' | 'info' | 'warning' | 'pull' | 'clear' | 'reset';
export type EntityType = string | 'all'; // Allow 'all' as a special entity type

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
    create: 'Création',
    success: 'Opération',
    error: 'Erreur',
    info: 'Information',
    warning: 'Avertissement',
    pull: 'Récupération',
    clear: 'Effacement',
    reset: 'Réinitialisation'
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

/**
 * Show form validation notification
 * @param formName Name of the form
 * @param success Whether the validation was successful
 * @param message Optional message
 */
export const showFormValidation = (
  formName: string,
  success: boolean,
  message?: string
): void => {
  if (success) {
    toast.success(`${formName} validé avec succès.`, { position: "bottom-right" });
  } else {
    toast.error(`Erreur de validation du ${formName}${message ? `: ${message}` : '.'}`, { position: "bottom-right" });
  }
};

/**
 * Show admin action notification
 * @param action Action name
 * @param entity Entity type
 * @param success Whether the action was successful
 * @param message Optional message
 */
export const showAdminAction = (
  action: string,
  entity: string,
  success: boolean,
  message?: string
): void => {
  if (success) {
    toast.success(`${action} ${entity} réussi.`, { position: "bottom-right" });
  } else {
    toast.error(`Échec de ${action} ${entity}${message ? `: ${message}` : '.'}`, { position: "bottom-right" });
  }
};
