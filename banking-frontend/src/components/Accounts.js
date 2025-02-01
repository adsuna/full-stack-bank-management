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
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  SwapHoriz as TransferIcon,
  AccountBalance as AccountIcon,
  TrendingUp as InvestmentIcon,
  Savings as SavingsIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MotionCard = motion(Card);

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewAccount, setOpenNewAccount] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newAccountType, setNewAccountType] = useState('');
  const [transferData, setTransferData] = useState({
    toAccount: '',
    amount: '',
    description: ''
  });
  const { token } = useAuth();

  const accountTypes = ['Checking', 'Savings', 'Investment'];

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/accounts/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreateAccount = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/accounts/create',
        { accountType: newAccountType },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setOpenNewAccount(false);
      setNewAccountType('');
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleTransfer = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/transactions/create',
        {
          fromAccountId: selectedAccount.id,
          toAccountId: transferData.toAccount,
          amount: parseFloat(transferData.amount),
          description: transferData.description,
          transactionType: 'transfer'
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setOpenTransfer(false);
      setTransferData({ toAccount: '', amount: '', description: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error making transfer:', error);
    }
  };

  const getAccountIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return <AccountIcon fontSize="large" />;
      case 'savings':
        return <SavingsIcon fontSize="large" />;
      case 'investment':
        return <InvestmentIcon fontSize="large" />;
      default:
        return <AccountIcon fontSize="large" />;
    }
  };

  const getAccountColor = (type) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return '#60a5fa';
      case 'savings':
        return '#34d399';
      case 'investment':
        return '#a78bfa';
      default:
        return '#60a5fa';
    }
  };

  const formatBalance = (balance) => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    return isNaN(numBalance) ? '0.00' : numBalance.toFixed(2);
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
            Your Accounts
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
            onClick={() => setOpenNewAccount(true)}
            sx={{
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1e40af, #5b21b6)',
              }
            }}
          >
            New Account
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={3}>
        <AnimatePresence>
          {accounts.map((account, index) => (
            <Grid item xs={12} md={6} lg={4} key={account.id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${getAccountColor(account.account_type)}20, ${getAccountColor(account.account_type)}10)`,
                  border: '1px solid',
                  borderColor: `${getAccountColor(account.account_type)}30`,
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
                  {getAccountIcon(account.account_type)}
                </Box>

                <Typography variant="h6" gutterBottom>
                  {account.account_type}
                </Typography>

                <Typography 
                  variant="h4" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 700,
                    color: getAccountColor(account.account_type)
                  }}
                >
                  ${formatBalance(account.balance)}
                </Typography>

                <Box sx={{ mt: 3, mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((parseFloat(account.balance) / 10000) * 100, 100)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: `${getAccountColor(account.account_type)}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getAccountColor(account.account_type)
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TransferIcon />}
                    onClick={() => {
                      setSelectedAccount(account);
                      setOpenTransfer(true);
                    }}
                    sx={{
                      borderColor: getAccountColor(account.account_type),
                      color: getAccountColor(account.account_type),
                      '&:hover': {
                        borderColor: getAccountColor(account.account_type),
                        backgroundColor: `${getAccountColor(account.account_type)}10`,
                      }
                    }}
                  >
                    Transfer
                  </Button>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* New Account Dialog */}
      <Dialog open={openNewAccount} onClose={() => setOpenNewAccount(false)}>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Account Type"
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value)}
          >
            {accountTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewAccount(false)}>Cancel</Button>
          <Button onClick={handleCreateAccount} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransfer} onClose={() => setOpenTransfer(false)}>
        <DialogTitle>Transfer Money</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="To Account"
            value={transferData.toAccount}
            onChange={(e) => setTransferData({ ...transferData, toAccount: e.target.value })}
          >
            {accounts
              .filter(acc => acc.id !== selectedAccount?.id)
              .map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.account_type} (${formatBalance(account.balance)})
                </MenuItem>
              ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            type="number"
            value={transferData.amount}
            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={transferData.description}
            onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransfer(false)}>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained">Transfer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Accounts; 