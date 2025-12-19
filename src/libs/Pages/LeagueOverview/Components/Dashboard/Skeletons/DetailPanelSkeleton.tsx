import styles from '../Dashboard.module.css';

export const DetailPanelSkeleton = () => {
  return (
    <div className={styles.detail}>
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        <div style={{ width: '40%', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
          <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
          <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginTop: '1rem' }} />
      </div>
    </div>
  );
};
