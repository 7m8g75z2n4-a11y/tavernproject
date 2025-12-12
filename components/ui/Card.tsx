import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return <div className={`card${className ? ` ${className}` : ""}`}>{children}</div>;
}

type CardHeaderProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function CardHeader({ title, description, actions }: CardHeaderProps) {
  return (
    <div className="card-header">
      {(title || description) && (
        <div>
          {title && <p className="card-title">{title}</p>}
          {description && <p className="card-subtitle">{description}</p>}
        </div>
      )}
      {actions && <div>{actions}</div>}
    </div>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="card-content">{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="card-footer">{children}</div>;
}
