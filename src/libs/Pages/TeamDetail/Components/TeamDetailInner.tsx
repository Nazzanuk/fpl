'use client';

import Image from 'next/image';
import { EntityLink } from '../../../Shared/Components/EntityLink/EntityLink';
import { Breadcrumbs } from '../../../Shared/Components/Breadcrumbs/Breadcrumbs';
import styles from './TeamDetail.module.css';

type Props = {
  team: any; // Type from FPL API
  players: any[];
  leagueId: number;
};

export const TeamDetailInner = ({ team, players, leagueId }: Props) => {
  const shirtUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${team.code}-110.png`;

  return (
    <div className={styles.container}>
      <Breadcrumbs
        items={[
          { label: 'League', href: `/league/${leagueId}` },
          { label: team.name },
        ]}
      />
      <div className={styles.header}>
        <div className={styles.teamInfo}>
            <Image 
                src={shirtUrl} 
                alt={team.name} 
                width={80} 
                height={80} 
                unoptimized
                className={styles.shirt} 
            />
            <div className={styles.nameBlock}>
                <h1 className={styles.name}>{team.name}</h1>
                <div className={styles.statsRow}>
                    <span className={styles.badge}>Strength: {team.strength}</span>
                </div>
            </div>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Squad</h2>
        <div className={styles.squadGrid}>
            {players.map(player => (
                <EntityLink
                    key={player.id}
                    type="player"
                    id={player.id}
                    label={player.web_name}
                    subtitle={player.now_cost ? `£${(player.now_cost / 10).toFixed(1)}` : ''}
                    variant="card"
                    className={styles.playerCard}
                    teamCode={player.team_code}
                />
            ))}
        </div>
      </div>
    </div>
  );
};
