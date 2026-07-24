import { toast } from "@/components/ui/use-toast";

type NotifyVariant = "default" | "destructive";

function showToast(title: string, description?: string, variant: NotifyVariant = "default") {
  toast({
    title,
    description,
    variant,
  });
}

export function notifySuccess(description: string, title = "Success") {
  showToast(title, description, "default");
}

export function notifyInfo(description: string, title = "Notice") {
  showToast(title, description, "default");
}

export function notifyError(description: string, title = "Something went wrong") {
  showToast(title, description, "destructive");
}

export function notifyWarning(description: string, title = "Attention") {
  showToast(title, description, "destructive");
}
