'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './EntityLink.module.css';

export type EntityType = 'player' | 'manager' | 'team' | 'fixture';

type Props = {
  type: EntityType;
  id: number;
  label: string;
  subtitle?: string;
  variant?: 'inline' | 'card' | 'badge';
  className?: string;
  contextLeagueId?: number; // Optional override handling
  teamCode?: number; // specialized for player/team badges
  children?: React.ReactNode;
};

export const EntityLink = ({
  type,
  id,
  label,
  subtitle,
  variant = 'inline',
  className = '',
  contextLeagueId,
  teamCode,
  children,
}: Props) => {
  const params = useParams();
  const leagueId = contextLeagueId || (params?.id ? parseInt(params.id as string, 10) : null);

  const content = children || (
    <>
      {renderIcon(type, teamCode)}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </>
  );

  if (!leagueId) {
    // Fallback if no league context context found - render span
    return (
      <span className={`${styles.link} ${styles[variant]} ${styles[type]} ${className}`}>
        {content}
      </span>
    );
  }

  const href = getEntityHref(leagueId, type, id);

  return (
    <Link 
      href={href} 
      className={`${styles.link} ${styles[variant]} ${styles[type]} ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent bubbling if inside other clickables
    >
      {content}
    </Link>
  );
};

const getEntityHref = (leagueId: number, type: EntityType, id: number): string => {
  const base = `/league/${leagueId}`;
  switch (type) {
    case 'player':
      return `${base}/player/${id}`;
    case 'manager':
      return `${base}/manager/${id}`;
    case 'team':
      return `${base}/team/${id}`;
    case 'fixture':
      // TODO: Decide on fixture routing. For now modal or placeholder. 
      // Using query param for modal trigger could be an option, but sticking to page strategy:
      return `${base}/fixture/${id}`; // To be implemented
    default:
      return base;
  }
};

const renderIcon = (type: EntityType, teamCode?: number) => {
  if (type === 'team' && teamCode) {
    const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}-66.png`;
    return (
      <div className={styles.iconWrapper}>
        <Image 
          src={shirtUrl} 
          alt="" 
          width={20} 
          height={20} 
          className={styles.shirtIcon}
          unoptimized 
        />
      </div>
    );
  }
  
  if (type === 'player' && teamCode) {
     // Similar shirt icon for players if code provided
     const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${teamCode}-66.png`;
     return (
      <div className={styles.iconWrapper}>
        <Image 
          src={shirtUrl} 
          alt="" 
          width={20} 
          height={20} 
          className={styles.shirtIcon}
          unoptimized 
        />
      </div>
    );
  }

  // Material symbols for others
  let iconName = '';
  switch (type) {
    case 'manager': iconName = 'person'; break;
    case 'player': iconName = 'sports_soccer'; break;
    case 'team': iconName = 'groups'; break;
    case 'fixture': iconName = 'calendar_month'; break;
  }

  if (!iconName) return null;

  return (
    <span className={`material-symbols-sharp ${styles.icon}`} style={{ fontSize: '18px' }}>
      {iconName}
    </span>
  );
};
