
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
      className: "bg-winshirt-space border border-winshirt-purple/30 text-white text-xs z-50",
      position: "bottom-right",
      style: { zIndex: 9999, maxWidth: "280px", padding: "8px 12px" }
    });
  },
  error: (message: string, options?: ToastProps) => {
    console.log("Error toast:", message);
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
      className: "bg-winshirt-space border border-red-500/30 text-white text-xs z-50",
      position: "bottom-right",
      style: { zIndex: 9999, maxWidth: "280px", padding: "8px 12px" }
    });
  },
  info: (message: string, options?: ToastProps) => {
    console.log("Info toast:", message);
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
      className: "bg-winshirt-space border border-winshirt-blue/30 text-white text-xs z-50",
      position: "bottom-right",
      style: { zIndex: 9999, maxWidth: "280px", padding: "8px 12px" }
    });
  },
  warning: (message: string, options?: ToastProps) => {
    console.log("Warning toast:", message);
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
      className: "bg-winshirt-space border border-yellow-500/30 text-white text-xs z-50",
      position: "bottom-right",
      style: { zIndex: 9999, maxWidth: "280px", padding: "8px 12px" }
    });
  },
  adminAction: (action: string, entity: string, status: string) => {
    console.log(`Admin ${action}:`, entity, status);
    return sonnerToast.info(`Admin: ${action} ${entity} ${status}`, {
      duration: 3000,
      className: "bg-winshirt-space border border-winshirt-purple/30 text-white text-xs z-50",
      position: "bottom-right",
      style: { zIndex: 9999, maxWidth: "280px", padding: "8px 12px" }
    });
  },
};
