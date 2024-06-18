// RequireAuth.js
import { useLocation, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function RequireAuth({ children }:any) {
  const location = useLocation();
  const { authStatus } = useAuthenticator((context) => [context.route]);
  if(authStatus ==='unauthenticated'){
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}