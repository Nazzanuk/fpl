'use client';

import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LeagueError({ error, reset }: Props) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('League Page Error:', error);
  }, [error]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#0a0f1c',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#d4af37' }}>League Not Found</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', color: '#cbd5e1' }}>
        We couldn't load the request league. This might be because the ID is invalid or the FPL API is currently unresponsive.
      </p>
      
      <div style={{ 
        padding: '1rem', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: '8px',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        color: '#94a3b8',
        maxWidth: '100%',
        overflow: 'auto'
      }}>
        <code>{error.message || 'Unknown Error Occurred'}</code>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#d4af37',
            color: '#0a0f1c',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          Try Again
        </button>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#d4af37',
            border: '1px solid #d4af37',
            borderRadius: '4px',
            fontWeight: '700',
            textDecoration: 'none',
            transition: 'background 0.2s'
          }}
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
