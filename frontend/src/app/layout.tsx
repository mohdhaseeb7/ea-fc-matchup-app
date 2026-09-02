import '../styles/globals.css';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'EA FC 27 Matchup Generator | Find Balanced EA FC Team Matchups',
  description: 'Discover balanced, rivalry, and playstyle-matched team vs team matchups for EA FC 26 & EA FC 27. Stop picking the same meta teams every match with friends!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
