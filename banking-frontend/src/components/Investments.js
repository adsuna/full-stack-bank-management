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
  InputAdornment
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  TrendingUp as InvestmentIcon,
  AccountBalance as FDIcon,
  ShowChart as StockIcon,
  PieChart as MutualFundIcon,
  MoreVert as MoreIcon,
  ArrowUpward as ProfitIcon,
  ArrowDownward as LossIcon,
  Remove as WithdrawIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MotionCard = motion(Card);

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    investmentType: '',
    amount: '',
    termMonths: '',
    interestRate: ''
  });
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openAddFunds, setOpenAddFunds] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [amount, setAmount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const { token } = useAuth();

  const investmentTypes = [
    { value: 'fd', label: 'Fixed Deposit', minTerm: 3, maxTerm: 60, baseRate: 4.5 },
    { value: 'mutual_fund', label: 'Mutual Fund', minAmount: 1000 },
    { value: 'stock', label: 'Stock Market', minAmount: 100 }
  ];

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/investments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(response.data.investments);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/accounts/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchInvestments();
    fetchAccounts();
  }, [fetchInvestments, fetchAccounts]);

  const handleCreateInvestment = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/investments/create',
        newInvestment,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setOpenNew(false);
      setNewInvestment({
        investmentType: '',
        amount: '',
        termMonths: '',
        interestRate: ''
      });
      fetchInvestments();
    } catch (error) {
      console.error('Error creating investment:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/investments/withdraw',
        {
          investmentId: selectedInvestment.id,
          accountId: selectedAccount,
          amount: parseFloat(amount)
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setOpenWithdraw(false);
      setAmount('');
      setSelectedAccount('');
      setSelectedInvestment(null);
      fetchInvestments();
      fetchAccounts();
    } catch (error) {
      console.error('Error withdrawing from investment:', error);
    }
  };

  const handleAddFunds = async () => {
    try {
      console.log('Adding funds:', {
        investmentId: selectedInvestment.id,
        accountId: selectedAccount,
        amount: parseFloat(amount)
      });

      await axios.post(
        'http://localhost:5000/api/investments/add-funds',
        {
          investmentId: selectedInvestment.id,
          accountId: selectedAccount,
          amount: parseFloat(amount)
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setOpenAddFunds(false);
      setAmount('');
      setSelectedAccount('');
      setSelectedInvestment(null);
      await fetchInvestments();
      await fetchAccounts();
    } catch (error) {
      console.error('Error response:', error.response?.data);
      console.error('Error adding funds to investment:', error);
    }
  };

  const getInvestmentIcon = (type) => {
    switch (type) {
      case 'fd':
        return <FDIcon fontSize="large" />;
      case 'mutual_fund':
        return <MutualFundIcon fontSize="large" />;
      case 'stock':
        return <StockIcon fontSize="large" />;
      default:
        return <InvestmentIcon fontSize="large" />;
    }
  };

  const getInvestmentColor = (type) => {
    switch (type) {
      case 'fd':
        return '#60a5fa';
      case 'mutual_fund':
        return '#a78bfa';
      case 'stock':
        return '#f472b6';
      default:
        return '#60a5fa';
    }
  };

  const formatNumber = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const calculateReturns = (investment) => {
    const monthsActive = Math.floor(
      (new Date() - new Date(investment.created_at)) / (1000 * 60 * 60 * 24 * 30)
    );
    const returns = investment.amount * (investment.interest_rate / 100) * (monthsActive / 12);
    return returns;
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
            Your Investments
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
            New Investment
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        <AnimatePresence>
          {investments.map((investment, index) => (
            <Grid item xs={12} md={6} lg={4} key={investment.id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${getInvestmentColor(investment.investment_type)}20, ${getInvestmentColor(investment.investment_type)}10)`,
                  border: '1px solid',
                  borderColor: `${getInvestmentColor(investment.investment_type)}30`,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  <Tooltip title="More options">
                    <IconButton size="small">
                      <MoreIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ mb: 2 }}>
                  {getInvestmentIcon(investment.investment_type)}
                </Box>

                <Typography variant="h6" gutterBottom>
                  {investmentTypes.find(t => t.value === investment.investment_type)?.label}
                </Typography>

                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: getInvestmentColor(investment.investment_type)
                  }}
                >
                  ${formatNumber(investment.amount)}
                </Typography>

                {investment.interest_rate && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={<ProfitIcon />}
                      label={`${investment.interest_rate}% APR`}
                      size="small"
                      color="success"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Returns: ${formatNumber(calculateReturns(investment))}
                    </Typography>
                  </Box>
                )}

                {investment.term_months && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Term: {investment.term_months} months
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((new Date() - new Date(investment.created_at)) / (investment.term_months * 30 * 24 * 60 * 60 * 1000) * 100, 100)} 
                      sx={{ 
                        mt: 1,
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: `${getInvestmentColor(investment.investment_type)}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getInvestmentColor(investment.investment_type)
                        }
                      }}
                    />
                  </Box>
                )}

                <Box sx={{ mt: 3 }}>
                  <Chip
                    label={investment.status}
                    color={
                      investment.status === 'active' ? 'success' :
                      investment.status === 'matured' ? 'info' :
                      'error'
                    }
                    sx={{ width: '100%' }}
                  />
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedInvestment(investment);
                      setOpenAddFunds(true);
                    }}
                    sx={{
                      flex: 1,
                      borderColor: getInvestmentColor(investment.investment_type),
                      color: getInvestmentColor(investment.investment_type),
                      '&:hover': {
                        borderColor: getInvestmentColor(investment.investment_type),
                        backgroundColor: `${getInvestmentColor(investment.investment_type)}10`,
                      }
                    }}
                  >
                    Add Funds
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<WithdrawIcon />}
                    onClick={() => {
                      setSelectedInvestment(investment);
                      setOpenWithdraw(true);
                    }}
                    sx={{
                      flex: 1,
                      borderColor: getInvestmentColor(investment.investment_type),
                      color: getInvestmentColor(investment.investment_type),
                      '&:hover': {
                        borderColor: getInvestmentColor(investment.investment_type),
                        backgroundColor: `${getInvestmentColor(investment.investment_type)}10`,
                      }
                    }}
                  >
                    Withdraw
                  </Button>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      <Dialog open={openNew} onClose={() => setOpenNew(false)}>
        <DialogTitle>Create New Investment</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Investment Type"
            value={newInvestment.investmentType}
            onChange={(e) => setNewInvestment({ 
              ...newInvestment, 
              investmentType: e.target.value 
            })}
          >
            {investmentTypes.map((type) => (
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
            value={newInvestment.amount}
            onChange={(e) => setNewInvestment({ 
              ...newInvestment, 
              amount: e.target.value 
            })}
          />
          {newInvestment.investmentType === 'fd' && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Term (months)"
                type="number"
                value={newInvestment.termMonths}
                onChange={(e) => setNewInvestment({ 
                  ...newInvestment, 
                  termMonths: e.target.value 
                })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Interest Rate (%)"
                type="number"
                value={newInvestment.interestRate}
                onChange={(e) => setNewInvestment({ 
                  ...newInvestment, 
                  interestRate: e.target.value 
                })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNew(false)}>Cancel</Button>
          <Button onClick={handleCreateInvestment} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openWithdraw} onClose={() => setOpenWithdraw(false)}>
        <DialogTitle>Withdraw from Investment</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="To Account"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_type} (${formatNumber(account.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWithdraw(false)}>Cancel</Button>
          <Button 
            onClick={handleWithdraw} 
            variant="contained"
            disabled={!selectedAccount || !amount}
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddFunds} onClose={() => setOpenAddFunds(false)}>
        <DialogTitle>Add Funds to Investment</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="From Account"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_type} (${formatNumber(account.balance)})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddFunds(false)}>Cancel</Button>
          <Button 
            onClick={handleAddFunds} 
            variant="contained"
            disabled={!selectedAccount || !amount}
          >
            Add Funds
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Investments; 