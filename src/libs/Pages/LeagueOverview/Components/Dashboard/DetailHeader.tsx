'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './DetailHeader.module.css';

type Props = {
  stack: string[];
};

export const DetailHeader = ({ stack }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  // Create breadcrumbs from the stack
  // Stack: ['manager', '123', 'player', '456']
  // Pairs: [['manager', '123'], ['player', '456']]
  const breadcrumbs = [];
  for (let i = 0; i < stack.length; i += 2) {
    if (i + 1 < stack.length) {
      breadcrumbs.push({
        type: stack[i],
        id: stack[i + 1],
        label: formatLabel(stack[i]),
        paramIndex: i + 1 // The index in the stack array where this item ends
      });
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    // If we click the 1st crumb (index 0), we want to keep the first pair (slice 0..2)
    // index 0 -> keep 2 items
    // index 1 -> keep 4 items
    const keepCount = (index + 1) * 2;
    const newStack = stack.slice(0, keepCount);
    
    // Construct new URL
    // Current pathname: /league/123/manager/123/player/456/...
    // We need to find the base part /league/[id]
    // A heuristic: split by '/' and reconstruct, or better: 
    // The current page is built from the stack. We can just append the new stack to the base.
    // BUT, we don't easily know the base "league/id" here without props.
    // Alternatively, we can assume the stack is at the END of the URL.
    
    // Let's rely on the router.push and simply "up" X levels?
    // No, that's brittle.
    // Let's use the known stack to reconstruct the relative path.
    // Actually, simply constructing the relative path from the current segment is better.
    // If we are at /a/b/c/d and we want /a/b, we go up 2 levels.
    
    const currentStackDepth = stack.length; // e.g. 4
    const targetStackDepth = newStack.length; // e.g. 2
    const levelsUp = (currentStackDepth - targetStackDepth) / 1; // segments are segments
    // actually, valid segments only.
    
    // Simplest approach: "Back" logic
    // But for arbitrary jump?
    // Let's assume absolute path construction if possible or use relative parent navigation.
    
    // Hacky but robust for now: 
    // The stack corresponds to the LAST segments of the URL.
    // So we can assume the URL ends with join('/', stack).
    // We can replace that suffix.
    const suffix = stack.join('/');
    const prefix = pathname.replace(new RegExp(`/${suffix}$`), '');
    
    // If we are already there, do nothing
    if (suffix === newStack.join('/')) return;
    
    router.push(`${prefix}/${newStack.join('/')}`);
  };

  const handleBack = () => {
    // Go back one "entity" pair
    if (stack.length >= 2) {
      const newStack = stack.slice(0, -2);
      const suffix = stack.join('/');
      // If new stack is empty, we go to the root (league overview)
      // But verify if pathname ends with the stack
      // If stack is empty, we might need to handle it gracefully (e.g. just go up 2 levels)
      
      const parts = pathname.split('/');
       // If parts end with last 2 segments, pop them
      const newPath = parts.slice(0, -2).join('/');
      router.push(newPath);
    } else {
        // Fallback
        router.back();
    }
  };

  const handleClose = () => {
     // Go to root of the detail view (empty) or just close?
     // "Close" usually means go back to just the league view without detail?
     // Or just use router.back()?
     // Let's assume Close means "Clear Detail Panel".
     // That would correspond to the base league URL: /league/[id]
     
     // Find where 'league' is and stop there?
     const match = pathname.match(/^(.*\/league\/\d+)/);
     if (match) {
         router.push(match[1]);
     } else {
         router.push('/');
     }
  };

  return (
    <div className={styles.header}>
      <div className={styles.breadcrumbs}>
        <button className={styles.crumb} onClick={handleClose}>
          <span className="material-symbols-sharp">home</span>
        </button>
        {breadcrumbs.map((crumb, index) => (
          <div key={`${crumb.type}-${crumb.id}`} className={styles.crumbWrapper}>
            <span className={styles.separator}>/</span>
            <button 
              className={`${styles.crumb} ${index === breadcrumbs.length - 1 ? styles.active : ''}`}
              onClick={() => handleBreadcrumbClick(index)}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </div>
      
      <div className={styles.actions}>
         {stack.length > 2 && (
             <button className={styles.actionBtn} onClick={handleBack} title="Go Back">
                <span className="material-symbols-sharp">arrow_back</span>
             </button>
         )}
        <button className={styles.actionBtn} onClick={handleClose} title="Close Panel">
          <span className="material-symbols-sharp">close</span>
        </button>
      </div>
    </div>
  );
};

const formatLabel = (type: string) => {
  switch (type) {
    case 'manager': return 'Manager';
    case 'player': return 'Player';
    case 'team': return 'Team';
    case 'fixture': return 'Fixture';
    default: return type.charAt(0).toUpperCase() + type.slice(1);
  }
};
