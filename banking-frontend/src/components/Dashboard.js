import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AccountBalance as AccountBalanceIcon,
  Payments as PaymentsIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  CreditScore as CreditScoreIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Reviews from './Reviews';

const MotionPaper = motion(Paper);

function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [totalBalance, setTotalBalance] = useState(0);

  const menuItems = [
    {
      title: 'Accounts',
      description: 'Manage your accounts and transfers',
      icon: <AccountBalanceIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/accounts',
      color: '#60a5fa'
    },
    {
      title: 'Transactions',
      description: 'View your transaction history',
      icon: <PaymentsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/transactions',
      color: '#34d399'
    },
    {
      title: 'Investments',
      description: 'Manage your investments',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/investments',
      color: '#a78bfa'
    },
    {
      title: 'Loans',
      description: 'View and apply for loans',
      icon: <CreditScoreIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      path: '/loans',
      color: '#f472b6'
    }
  ];

  const fetchBalance = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/accounts/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const balance = response.data.accounts.reduce(
        (sum, account) => sum + parseFloat(account.balance), 
        0
      );
      
      setTotalBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            Welcome to Your Banking Dashboard
          </Typography>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #60a5fa20, #60a5fa10)',
              border: '1px solid',
              borderColor: '#60a5fa30',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBalanceIcon 
                sx={{ 
                  fontSize: 48, 
                  color: '#60a5fa' 
                }} 
              />
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Total Balance
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#60a5fa'
                  }}
                >
                  ${totalBalance.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Main Menu Section */}
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} md={6} key={item.title}>
                <MotionPaper
                  variants={item}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                    border: '1px solid',
                    borderColor: `${item.color}30`,
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      mb: 2,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography color="textSecondary" align="center">
                    {item.description}
                  </Typography>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
      <Reviews />
    </>
  );
}

export default Dashboard;