import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as originalToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
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
// during the render phase of other components (avoids React warning).
function createDeferredToast() {
  const wrapped: any = (...args: any[]) => {
    setTimeout(() => {
      try {
        (originalToast as any)(...args);
      } catch (e) {
        console.error('Deferred toast error', e);
      }
    }, 0);
  };

  // Copy all callable properties from originalToast (like .success/.error)
  Object.keys(originalToast).forEach((key) => {
    try {
      const val = (originalToast as any)[key];
      if (typeof val === 'function') {
        wrapped[key] = (...args: any[]) => {
          setTimeout(() => {
            try {
              (val as any)(...args);
            } catch (e) {
              console.error('Deferred toast method error', e);
            }
          }, 0);
        };
      } else {
        wrapped[key] = val;
      }
    } catch (e) {
      // ignore any non-enumerable properties
    }
  });

  return wrapped;
}

const toast = createDeferredToast();

export { Toaster, toast };
