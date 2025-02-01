import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Chip,
  Box,
  CircularProgress,
  Card,
  IconButton,
  InputBase,
  Tooltip,
  Fade
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CompareArrows as TransferIcon,
  CallReceived as DepositIcon,
  CallMade as WithdrawalIcon,
  Receipt as BillIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MotionTableRow = motion(TableRow);

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useAuth();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/transactions?page=${page}&limit=${rowsPerPage}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setTransactions(response.data.transactions);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [token, page, rowsPerPage]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'transfer':
        return <TransferIcon />;
      case 'deposit':
        return <DepositIcon color="success" />;
      case 'withdrawal':
        return <WithdrawalIcon color="error" />;
      case 'bill_payment':
        return <BillIcon color="warning" />;
      default:
        return <TransferIcon />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'transfer':
        return 'primary';
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'error';
      case 'bill_payment':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatAccountInfo = (accountType) => {
    return accountType || 'External Account';
  };

  const formatNumber = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const formatAmount = (amount, type, fromAccount) => {
    // Show negative for withdrawals or transfers from user's account
    const isNegative = type === 'withdrawal' || (type === 'transfer' && fromAccount);
    return `${isNegative ? '-' : ''}$${Math.abs(amount).toFixed(2)}`;
  };

  const filteredTransactions = transactions.filter(transaction => 
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatAccountInfo(transaction.from_account_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatAccountInfo(transaction.to_account_type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
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
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Transaction History
        </Typography>
      </motion.div>

      <Card 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: 400,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none'
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search transactions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton type="button" sx={{ p: '10px' }}>
              <SearchIcon />
            </IconButton>
          </Paper>
          <Tooltip title="Filter transactions">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filteredTransactions.map((transaction, index) => (
                  <MotionTableRow
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transition: 'background-color 0.3s ease'
                      }
                    }}
                  >
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getTransactionIcon(transaction.transaction_type)}
                        label={transaction.transaction_type.replace('_', ' ')}
                        color={getTransactionColor(transaction.transaction_type)}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          '& .MuiChip-icon': { fontSize: 16 }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {formatAccountInfo(transaction.from_account_type)}
                    </TableCell>
                    <TableCell>
                      {formatAccountInfo(transaction.to_account_type)}
                    </TableCell>
                    <TableCell 
                      align="right" 
                      sx={{
                        color: transaction.transaction_type === 'deposit' ? 'success.main' : 
                               transaction.transaction_type === 'withdrawal' ? 'error.main' : 
                               'text.primary',
                        fontWeight: 500
                      }}
                    >
                      {formatNumber(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </MotionTableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}

export default Transactions; 