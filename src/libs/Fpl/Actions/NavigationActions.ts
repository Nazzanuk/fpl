'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema for navigation validation
const LeagueNavigationSchema = z.object({
  leagueId: z.string().regex(/^\d+$/, 'League ID must be numeric'),
  view: z.enum(['standings', 'h2h', 'differentials', 'ownership', 'trends', 'fixtures']).optional(),
  managerId: z.string().regex(/^\d+$/, 'Manager ID must be numeric').optional(),
  playerId: z.string().regex(/^\d+$/, 'Player ID must be numeric').optional(),
});

// Server action to navigate to league with specific view
export async function navigateToLeagueView(formData: FormData) {
  let url = '';
  try {
    const leagueId = formData.get('leagueId') as string;
    const view = formData.get('view') as string;
    const managerId = formData.get('managerId') as string;
    
    const validated = LeagueNavigationSchema.parse({
      leagueId,
      view: view || undefined,
      managerId: managerId || undefined,
    });
    
    url = `/league/${validated.leagueId}`;
    
    if (validated.view && validated.view !== 'standings') {
      url += `/${validated.view}`;
    }
    
    // Add manager as query parameter for certain views
    if (validated.managerId && (validated.view === 'h2h' || !validated.view)) {
      url += `?manager=${validated.managerId}`;
    }
    
  } catch (error) {
    console.error('Navigation failed:', error);
    // Fallback to basic league page
    const leagueId = formData.get('leagueId') as string;
    if (leagueId && /^\d+$/.test(leagueId)) {
      url = `/league/${leagueId}`;
    } else {
      throw new Error('Invalid navigation parameters');
    }
  }

  if (url) {
    redirect(url);
  }
}

// Server action to navigate to manager detail
export async function navigateToManagerDetail(formData: FormData) {
  let url = '';
  try {
    const leagueId = formData.get('leagueId') as string;
    const managerId = formData.get('managerId') as string;
    const section = formData.get('section') as string; // 'history' or 'transfers'
    
    const validated = LeagueNavigationSchema.parse({
      leagueId,
      managerId,
    });
    
    url = `/league/${validated.leagueId}/manager/${validated.managerId}`;
    
    if (section === 'history' || section === 'transfers') {
      url += `/${section}`;
    }
    
  } catch (error) {
    console.error('Manager navigation failed:', error);
    throw new Error('Invalid manager navigation parameters');
  }

  if (url) {
    redirect(url);
  }
}

// Server action to navigate to player detail
export async function navigateToPlayerDetail(formData: FormData) {
  let url = '';
  try {
    const leagueId = formData.get('leagueId') as string;
    const playerId = formData.get('playerId') as string;
    
    const validated = LeagueNavigationSchema.parse({
      leagueId,
      playerId,
    });
    
    url = `/league/${validated.leagueId}/player/${validated.playerId}`;
  } catch (error) {
    console.error('Player navigation failed:', error);
    throw new Error('Invalid player navigation parameters');
  }

  if (url) {
    redirect(url);
  }
}

// Server action to navigate to tools
export async function navigateToTool(formData: FormData) {
  let url = '';
  try {
    const leagueId = formData.get('leagueId') as string;
    const tool = formData.get('tool') as string;
    
    const validTools = ['fdr-planner', 'transfer-planner', 'chip-advisor'];
    
    if (!leagueId || !/^\d+$/.test(leagueId)) {
      throw new Error('Invalid league ID');
    }
    
    if (!validTools.includes(tool)) {
      throw new Error('Invalid tool');
    }
    
    url = `/league/${leagueId}/tools/${tool}`;
  } catch (error) {
    console.error('Tool navigation failed:', error);
    throw new Error('Invalid tool navigation parameters');
  }

  if (url) {
    redirect(url);
  }
}

// Server action for league search/entry
export async function navigateToLeague(formData: FormData) {
  const leagueId = formData.get('leagueId') as string;

  try {
    if (!leagueId || !/^\d+$/.test(leagueId)) {
      throw new Error('Please enter a valid league ID');
    }
    
    // Revalidate the league data when navigating
    revalidatePath(`/league/${leagueId}`);
    
  } catch (error) {
    console.error('League navigation failed:', error);
    throw new Error('Please enter a valid league ID');
  }

  if (leagueId) {
    redirect(`/league/${leagueId}`);
  }
}