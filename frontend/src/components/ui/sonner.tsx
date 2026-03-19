import { Toaster as Sonner, toast as originalToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Wrap the original toast to defer invocations so they don't cause state updates
// during the render phase of other components (avoids React warning). This ensures
// that even methods like `toast.success` are deferred, regardless of whether they
// are enumerable properties on the toast function.
function createDeferredToast() {
  const handler: ProxyHandler<typeof originalToast> = {
    apply(target, thisArg, args) {
      setTimeout(() => {
        try {
          target.apply(thisArg, args);
        } catch (e) {
          console.error('Deferred toast error', e);
        }
      }, 0);
    },
    get(target, prop) {
      const value = (target as any)[prop];
      if (typeof value === 'function') {
        return (...args: any[]) => {
          setTimeout(() => {
            try {
              value.apply(target, args);
            } catch (e) {
              console.error('Deferred toast method error', e);
            }
          }, 0);
        };
      }
      return value;
    },
  };

  return new Proxy(originalToast, handler) as typeof originalToast;
}

const toast = createDeferredToast();

export { Toaster, toast };
