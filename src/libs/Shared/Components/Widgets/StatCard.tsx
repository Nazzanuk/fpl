import { ReactNode } from 'react';
import styles from './StatCard.module.css';

type StatCardProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export const StatCard = ({ title, children, footer, className = '' }: StatCardProps) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};
