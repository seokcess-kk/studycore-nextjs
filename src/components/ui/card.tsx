import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm",
        elevated: "bg-card shadow-lg hover:shadow-xl",
        outline: "bg-transparent border-2",
        glass: "bg-card/80 backdrop-blur-xl border-border/50 shadow-lg",
        gradient: "bg-card relative overflow-hidden before:absolute before:inset-0 before:p-px before:rounded-[inherit] before:bg-gradient-to-br before:from-primary/20 before:to-primary/5 before:-z-10",
        interactive: "bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        glow: "bg-card shadow-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

// React 19: ref is a regular prop
export function Card({
  className,
  variant,
  ref,
  ...props
}: CardProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  );
}

export function CardFooter({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

export { cardVariants };
