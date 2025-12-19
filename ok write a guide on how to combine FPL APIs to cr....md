Hello Nathan. Given your background with Next.js and Node, this guide focuses on the architectural pattern required to solve the "N+1" query problem inherent in FPL live tracking1.

The standard standings endpoint provides cached data that is outdated during live matches2. To build a live table, you must synthesize data from three distinct API sources.

### **1\. Architectural Strategy**

You cannot get a live table from a single endpoint. You must implement an aggregation pattern:

1. **Fetch League Members:** Retrieve the list of Manager IDs (entry\_id)3.

2. **Fetch Live Game State (Broad):** Retrieve the "Live" payload containing stats for *every* player in the league for the current Gameweek4.

3. **Fetch Team Picks (Deep):** Fetch the specific lineup for each manager. This is the bottleneck (N requests)5.

4. **Compute:** Map live stats to picks, applying captaincy multipliers and auto-substitution logic locally666.

---

### **2\. Type Definitions**

Use strict types to normalize the relational data points7.

TypeScript

// Types for League Data  
export type LeagueStandings \= {  
  league: { id: number; name: string }  
  standings: {  
    results: Array\<{  
      entry: number // Manager ID  
      player\_name: string  
      entry\_name: string  
      total: number // Previous total, not live  
    }\>  
    has\_next: boolean  
  }  
}

// Types for Manager's Specific Team (Picks)  
export type ManagerPick \= {  
  element: number // Player ID  
  position: number // 1-15 (1-11 starters, 12-15 bench)  
  is\_captain: boolean  
  is\_vice\_captain: boolean  
  multiplier: number  
}

export type ManagerTeamPayload \= {  
  active\_chip: string | null  
  entry\_history: { points: number; total\_points: number }  
  picks: ManagerPick\[\]  
}

// Types for Live Gameweek Data (The "Stats" Object)  
export type LiveElementStats \= {  
  minutes: number  
  total\_points: number  
  bonus: number  
  bps: number  
}

export type LiveGameweekPayload \= {  
  elements: Array\<{  
    id: number  
    stats: LiveElementStats  
    explain: any\[\] // Audit trail for points  
  }\>  
}

export type LiveManagerScore \= {  
  managerId: number  
  managerName: string  
  liveGWPoints: number  
  liveTotalPoints: number  
}

---

### **3\. The Implementation**

This implementation uses a batching strategy to mitigate rate limits (approx. 100 req/min)8.

#### **Step A: Fetching the Raw Data**

You need the current Gameweek (GW) ID from bootstrap-static before running this9.

TypeScript

const BASE\_URL \= 'https://fantasy.premierleague.com/api'

// 1\. Get League Managers (Paginated)  
export const getLeagueManagers \= async (leagueId: number, page \= 1): Promise\<number\[\]\> \=\> {  
  const res \= await fetch(\`${BASE\_URL}/leagues-classic/${leagueId}/standings/?page\_new\_entries=${page}\&page\_standings=${page}\`)  
  if (\!res.ok) throw new Error('Failed to fetch league')  
    
  const data: LeagueStandings \= await res.json()  
  return data.standings.results.map((r) \=\> r.entry)  
}

// 2\. Get Live Stats for ALL players (Single Request)  
// Updates every 2-5 mins during matches \[cite: 98\]  
export const getLiveStats \= async (gw: number): Promise\<Map\<number, LiveElementStats\>\> \=\> {  
  const res \= await fetch(\`${BASE\_URL}/event/${gw}/live/\`)  
  const data: LiveGameweekPayload \= await res.json()  
    
  // Transform to Map for O(1) lookup during calculation  
  const statsMap \= new Map\<number, LiveElementStats\>()  
  data.elements.forEach((el) \=\> statsMap.set(el.id, el.stats))  
    
  return statsMap  
}

// 3\. Get Specific Manager Picks (The N+1 Bottleneck)  
//   
export const getManagerPicks \= async (managerId: number, gw: number): Promise\<ManagerTeamPayload\> \=\> {  
  const res \= await fetch(\`${BASE\_URL}/entry/${managerId}/event/${gw}/picks/\`)  
  if (\!res.ok) throw new Error(\`Failed fetch for manager ${managerId}\`)  
  return res.json()  
}

#### **Step B: The Orchestrator (Rate Limited)**

Since you must fetch picks for *every* manager, using Promise.all on a large array will trigger a 429 error10. Use a concurrency limiter.

TypeScript

import { pLimit } from 'plimit-lit'; // Hypothetical lightweight concurrency lib

export const buildLiveTable \= async (leagueId: number, currentGw: number) \=\> {  
  // 1\. Fetch League & Live Data in parallel  
  const \[managerIds, liveStats\] \= await Promise.all(\[  
    getLeagueManagers(leagueId),  
    getLiveStats(currentGw)  
  \])

  // 2\. Fetch Picks with Concurrency Control (Max 5 concurrent requests)  
  // \[cite: 239\]  
  const limit \= pLimit(5)   
    
  const managersData \= await Promise.all(  
    managerIds.map((id) \=\>   
      limit(async () \=\> {  
        const team \= await getManagerPicks(id, currentGw)  
        return { id, team }  
      })  
    )  
  )

  // 3\. Calculate Scores locally  
  return managersData.map(({ id, team }) \=\> calculateLiveScore(id, team, liveStats))  
    .sort((a, b) \=\> b.liveTotalPoints \- a.liveTotalPoints)  
}

#### **Step C: The Calculation Engine**

You must implement a local scoring engine. The API does not calculate live captaincy or auto-subs for you11.

TypeScript

const calculateLiveScore \= (  
  managerId: number,   
  team: ManagerTeamPayload,   
  liveStats: Map\<number, LiveElementStats\>  
): LiveManagerScore \=\> {  
  let gwPoints \= 0  
    
  // Filter for starting 11 (positions 1-11)  
  // Note: Auto-sub logic is complex and omitted for brevity,   
  // but essentially involves checking if starters have 0 minutes   
  // and swapping in bench players\[cite: 183\].  
  const starters \= team.picks.filter(p \=\> p.position \<= 11)

  starters.forEach((pick) \=\> {  
    const stats \= liveStats.get(pick.element)  
    if (\!stats) return

    let points \= stats.total\_points  
      
    // Handle Captaincy \[cite: 184\]  
    // Note: If Captain minutes \== 0, logic must switch to Vice Captain  
    if (pick.is\_captain) {  
      points \*= pick.multiplier // Usually 2, or 3 for Triple Captain  
    } else if (pick.is\_vice\_captain && /\* captain didn't play logic \*/ false) {  
      points \*= 2  
    }

    gwPoints \+= points  
  })

  // Add transfer cost deduction if applicable  
  gwPoints \-= team.entry\_history.event\_transfers\_cost

  return {  
    managerId,  
    managerName: "Fetch from Bootstrap or separate map",   
    liveGWPoints: gwPoints,  
    liveTotalPoints: team.entry\_history.total\_points \+ gwPoints // Approx total  
  }  
}

### **4\. Critical Engineering Considerations**

* **Caching Strategy:** The event/{gw}/live endpoint is "read-heavy". You should cache this response for 60 seconds. The manager picks (entry/{id}/event/{gw}/picks) change only once per week (at the deadline). These **must** be cached indefinitely once the Gameweek is finished: false but deadline\_passed: true to avoid hitting the N+1 bottleneck repeatedly12.

* **BPS Projections:** The live feed provides raw bps (Bonus Points System) scores. To display "projected bonus points" (3, 2, 1), you must sort the players in that fixture by bps descending and resolve ties locally. The API does not return the final bonus points until the match is fully processed13131313.

* **Pagination:** If your league has \>50 users, you must recursively call getLeagueManagers using the has\_next flag14.

### **5\. Next Step**

Would you like me to write the resolveAutoSubs function to handle the logic of swapping bench players when starters have zero minutes, or detail how to implement the BPS projection algorithm?