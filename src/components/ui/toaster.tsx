'use client';

import * as React from 'react';

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        title?: string;
        description?: string;
      }>;

      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id,
          title: customEvent.detail.title,
          description: customEvent.detail.description,
        },
      ]);

      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id)
        );
      }, 4000);
    };

    window.addEventListener('app-toast', handler);

    return () => {
      window.removeEventListener('app-toast', handler);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <Toast key={toast.id}>
          <div className="grid gap-1">
            {toast.title && (
              <ToastTitle>{toast.title}</ToastTitle>
            )}

            {toast.description && (
              <ToastDescription>
                {toast.description}
              </ToastDescription>
            )}
          </div>
        </Toast>
      ))}

      <ToastViewport />
    </ToastProvider>
  );
}