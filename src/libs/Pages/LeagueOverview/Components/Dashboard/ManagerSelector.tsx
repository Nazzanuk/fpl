'use client';

import { useRouter } from 'next/navigation';
import styles from './ManagerSelector.module.css';

type Manager = {
    id: number;
    name: string;
    teamName: string;
};

type Props = {
    managers: Manager[];
    leagueId: number;
    currentManagerId?: number;
};

export const ManagerSelector = ({ managers, currentManagerId }: Props) => {
    const router = useRouter();

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newManagerId = e.target.value;
        if (!newManagerId) return;

        // Set cookie and refresh to trigger server component re-render
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        document.cookie = `currentlySelectedManagerId=${newManagerId}; path=/; max-age=31536000`;

        // Trigger server component re-render to pick up new cookie value
        router.refresh();
    };

    return (
        <div className={styles.container}>
            <div className={styles.selectWrapper}>
                <select
                    className={styles.select}
                    value={currentManagerId || ''}
                    onChange={handleChange}
                >
                    <option value="" disabled>Select Manager</option>
                    {managers.map(m => (
                        <option key={m.id} value={m.id} className={styles.option}>
                            {m.name} ({m.teamName})
                        </option>
                    ))}
                </select>
                <div className={styles.icon}>
                    <span className="material-symbols-sharp" style={{ fontSize: '16px' }}>
                        expand_more
                    </span>
                </div>
            </div>
        </div>
    );
};
