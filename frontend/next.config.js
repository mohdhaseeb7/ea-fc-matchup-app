/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ea-fc-matchup-backend.onrender.com';
    return [
      {
        source: '/api/teams/:path*',
        destination: `${backendUrl}/api/teams/:path*`,
      },
      {
        source: '/api/matchups/:path*',
        destination: `${backendUrl}/api/matchups/:path*`,
      },
      {
        source: '/api/favorites/:path*',
        destination: `${backendUrl}/api/favorites/:path*`,
      },
      {
        source: '/api/match-logs/:path*',
        destination: `${backendUrl}/api/match-logs/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
