// Auth is disabled for now — all routes are accessible without login
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
