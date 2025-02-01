import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Stack
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  AccountBalance as PersonalIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MotionCard = motion(Card);

function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [newLoan, setNewLoan] = useState({
    loanType: '',
    amount: '',
    termMonths: '',
    purpose: ''
  });
  const { token } = useAuth();

  const loanTypes = [
    { value: 'home', label: 'Home Loan', maxAmount: 500000, maxTerm: 360, baseRate: 4.5 },
    { value: 'car', label: 'Car Loan', maxAmount: 75000, maxTerm: 72, baseRate: 6.5 },
    { value: 'personal', label: 'Personal Loan', maxAmount: 50000, maxTerm: 60, baseRate: 9.5 }
  ];

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleApplyLoan = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/loans/apply',
        newLoan,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setOpenNew(false);
      setNewLoan({
        loanType: '',
        amount: '',
        termMonths: '',
        purpose: ''
      });
      fetchLoans();
    } catch (error) {
      console.error('Error applying for loan:', error);
    }
  };

  const getLoanIcon = (type) => {
    switch (type) {
      case 'home':
        return <HomeIcon fontSize="large" />;
      case 'car':
        return <CarIcon fontSize="large" />;
      case 'personal':
        return <PersonalIcon fontSize="large" />;
      default:
        return <PersonalIcon fontSize="large" />;
    }
  };

  const getLoanColor = (type) => {
    switch (type) {
      case 'home':
        return '#60a5fa';
      case 'car':
        return '#34d399';
      case 'personal':
        return '#a78bfa';
      default:
        return '#60a5fa';
    }
  };

  const formatNumber = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const calculateEMI = (loan) => {
    const p = loan.amount;
    const r = (loan.interest_rate / 12) / 100;
    const n = loan.term_months;
    const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const calculateProgress = (loan) => {
    const monthsPassed = Math.floor(
      (new Date() - new Date(loan.created_at)) / (1000 * 60 * 60 * 24 * 30)
    );
    return (monthsPassed / loan.term_months) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Your Loans
          </Typography>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenNew(true)}
            sx={{
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1e40af, #5b21b6)',
              }
            }}
          >
            Apply for Loan
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        <AnimatePresence>
          {loans.map((loan, index) => (
            <Grid item xs={12} md={6} key={loan.id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${getLoanColor(loan.loan_type)}20, ${getLoanColor(loan.loan_type)}10)`,
                  border: '1px solid',
                  borderColor: `${getLoanColor(loan.loan_type)}30`,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  {getLoanIcon(loan.loan_type)}
                  <Box>
                    <Typography variant="h6">
                      {loanTypes.find(t => t.value === loan.loan_type)?.label}
                    </Typography>
                    <Chip
                      label={loan.status}
                      size="small"
                      color={
                        loan.status === 'approved' ? 'success' :
                        loan.status === 'pending' ? 'warning' :
                        loan.status === 'active' ? 'info' :
                        'error'
                      }
                    />
                  </Box>
                </Stack>

                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: getLoanColor(loan.loan_type)
                  }}
                >
                  ${formatNumber(loan.amount)}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Interest Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {loan.interest_rate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Payment
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      ${formatNumber(calculateEMI(loan))}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <TimelineIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Progress ({Math.min(calculateProgress(loan), 100).toFixed(1)}%)
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(calculateProgress(loan), 100)}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: `${getLoanColor(loan.loan_type)}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getLoanColor(loan.loan_type)
                      }
                    }}
                  />
                </Box>

                {loan.next_due_date && (
                  <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Next Payment: {new Date(loan.next_due_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </MotionCard>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      <Dialog open={openNew} onClose={() => setOpenNew(false)}>
        <DialogTitle>Apply for Loan</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Loan Type"
            value={newLoan.loanType}
            onChange={(e) => setNewLoan({ ...newLoan, loanType: e.target.value })}
          >
            {loanTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={newLoan.amount}
            onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Term (months)"
            type="number"
            value={newLoan.termMonths}
            onChange={(e) => setNewLoan({ ...newLoan, termMonths: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Purpose"
            multiline
            rows={3}
            value={newLoan.purpose}
            onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNew(false)}>Cancel</Button>
          <Button onClick={handleApplyLoan} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Loans; 