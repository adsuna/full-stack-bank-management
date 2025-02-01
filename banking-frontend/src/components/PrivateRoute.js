import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { token } = useAuth();

  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;