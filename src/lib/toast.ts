
import { toast as shadcnToast } from "@/hooks/use-toast";
import { ToastActionElement } from "@/components/ui/toast";

type ToastPosition = "top-right" | "top" | "top-left" | "bottom-left" | "bottom" | "bottom-right";

interface ToastOptions {
  action?: ToastActionElement;
  description?: string;
  duration?: number;
  position?: ToastPosition;
}

// Create a unified toast API with consistent styling and positioning
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
      className: `${getPositionClass(options?.position || "bottom-right")} bg-green-600/90 text-white`,
      variant: "default",
    });
  },
  error: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 7000,
      className: `${getPositionClass(options?.position || "bottom-right")}`,
      variant: "destructive",
    });
  },
  warning: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 5000,
      className: `${getPositionClass(options?.position || "bottom-right")} bg-amber-600/90 text-white`,
      variant: "default",
    });
  },
  info: (message: string, options?: ToastOptions) => {
    return shadcnToast({
      title: message,
      description: options?.description,
      action: options?.action,
      duration: options?.duration || 4000,
      className: `${getPositionClass(options?.position || "bottom-right")} bg-blue-600/90 text-white`,
      variant: "default",
    });
  },
};

// Helper function to get position classes based on the requested position
function getPositionClass(position: ToastPosition): string {
  // The actual positioning is now handled by ToastViewport
  // This function returns additional positioning classes if needed
  switch (position) {
    case "top-right":
      return "top-0 right-0";
    case "top":
      return "top-0 left-1/2 -translate-x-1/2";
    case "top-left":
      return "top-0 left-0";
    case "bottom-left":
      return "bottom-0 left-0";
    case "bottom":
      return "bottom-0 left-1/2 -translate-x-1/2";
    case "bottom-right":
    default:
      return "";
  }
}
