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
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone as PhoneIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  HowToReg as RegisterIcon
} from '@mui/icons-material';
import axios from 'axios';

const MotionPaper = motion(Paper);

function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const steps = ['Personal Info', 'Contact Details', 'Security'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      setError('Error registering user');
    }
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber;
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TextField
              required
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>
        );
      case 1:
        return (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ 
                  ...formData, 
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TextField
                required
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>
          </>
        );
      case 2:
        return (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TextField
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TextField
                required
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                sx={{ mt: 2 }}
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
          </>
        );
      default:
        return null;
    }
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
            gap: 3
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
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
              Create Account
            </Typography>
          </motion.div>

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 2, minHeight: '150px' }}>
            <AnimatePresence mode='wait'>
              {getStepContent(activeStep)}
            </AnimatePresence>
          </Box>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error">
                {error}
              </Alert>
            </motion.div>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              endIcon={activeStep === steps.length - 1 ? <RegisterIcon /> : <NextIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1e40af, #5b21b6)',
                }
              }}
            >
              {activeStep === steps.length - 1 ? 'Register' : 'Next'}
            </Button>
          </Box>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ mt: 1 }}
            >
              Already have an account? Sign in
            </Button>
          </motion.div>
        </Box>
      </MotionPaper>
    </Container>
  );
}

export default Register; 