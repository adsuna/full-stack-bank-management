import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MotionPaper = motion(Paper);

function Login() {
  const [credentials, setCredentials] = useState({ 
    phoneNumber: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber;
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center' 
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={3}
        sx={{ 
          p: 4, 
          width: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2 
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Welcome Back
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TextField
              required
              fullWidth
              label="Phone Number"
              value={credentials.phoneNumber}
              onChange={(e) => setCredentials({ 
                ...credentials, 
                phoneNumber: formatPhoneNumber(e.target.value) 
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TextField
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({ 
                ...credentials, 
                password: e.target.value 
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large"
              sx={{ 
                mt: 2,
                height: 48,
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1e40af, #5b21b6)',
                }
              }}
              endIcon={<LoginIcon />}
            >
              Sign In
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              sx={{ mt: 1 }}
            >
              Don't have an account? Sign up
            </Button>
          </motion.div>
        </Box>
      </MotionPaper>
    </Container>
  );
}

export default Login;