
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
};

export const toast = {
  success: (message: string, options?: ToastProps) => {
    console.log("Success toast:", message);
    return sonnerToast.success(message, {
      duration: 4000,
      ...options,
    });
  },
  error: (message: string, options?: ToastProps) => {
    console.log("Error toast:", message);
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
    });
  },
  info: (message: string, options?: ToastProps) => {
    console.log("Info toast:", message);
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
    });
  },
  warning: (message: string, options?: ToastProps) => {
    console.log("Warning toast:", message);
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
    });
  },
  // Customized toast for admin notifications
  adminAction: (action: string, entity: string, status: string) => {
    console.log(`Admin ${action}:`, entity, status);
    return sonnerToast.info(`Admin: ${action} ${entity} ${status}`, {
      duration: 3000,
      className: "admin-notification-toast",
    });
  },
};
