import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Live gameweek data - very short cache for real-time updates
    live: {
      stale: 15,      // 15 seconds client stale
      revalidate: 30, // 30 seconds server revalidate
      expire: 60,     // 1 minute expire
    },
    // Semi-dynamic data during active gameweeks
    gameweek: {
      stale: 60,       // 1 minute client stale  
      revalidate: 120, // 2 minutes server revalidate
      expire: 300,     // 5 minutes expire
    },
    // Static data that rarely changes (between gameweeks)
    static: {
      stale: 3600,      // 1 hour client stale
      revalidate: 1800, // 30 minutes server revalidate
      expire: 7200,     // 2 hours expire
    },
    // Player historical data (fixture history, past seasons)
    historical: {
      stale: 86400,     // 24 hours client stale
      revalidate: 3600, // 1 hour server revalidate
      expire: 86400,    // 24 hours expire
    },
  },
};

export default nextConfig;
