
import { toast as shadcnToast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";

type ToastPosition = "top-right" | "top" | "top-left" | "bottom-left" | "bottom" | "bottom-right";

interface ToastOptions {
  action?: ToastActionElement;
  description?: string;
  duration?: number;
  position?: ToastPosition;
}

// Helper function to provide consistent toast API
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
      className: `${getPositionClass(options?.position || "bottom-right")} bg-green-600/90`,
      variant: "default",
    });
  },
  error: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 7000,
      className: getPositionClass(options?.position || "bottom-right"),
      variant: "destructive",
    });
  },
  warning: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
      className: getPositionClass(options?.position || "bottom-right") + " bg-amber-600/90",
      variant: "default",
    });
  },
  info: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
      className: getPositionClass(options?.position || "bottom-right") + " bg-blue-600/90",
      variant: "default",
    });
  },
};

// Helper to get position-specific classes
function getPositionClass(position: ToastPosition): string {
  switch (position) {
    case "top-right":
      return "top-4 right-4 fixed";
    case "top":
      return "top-4 left-1/2 -translate-x-1/2 fixed";
    case "top-left":
      return "top-4 left-4 fixed";
    case "bottom-left":
      return "bottom-4 left-4 fixed";
    case "bottom":
      return "bottom-4 left-1/2 -translate-x-1/2 fixed";
    case "bottom-right":
    default:
      return "bottom-4 right-4 fixed";
  }
}
