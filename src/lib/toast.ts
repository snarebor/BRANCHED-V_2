export function showToast({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: {
        title,
        description,
      },
    })
  );
}