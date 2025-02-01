import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  List,
  ListItem,
  Button,
  Fab,
  Avatar,
  Stack
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  AccountBalance as AccountIcon,
  Payments as PaymentsIcon,
  CreditScore as LoanIcon,
  AccountBalanceWallet as InvestIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your banking assistant. How can I help you today?", isBot: true, showOptions: true }
  ]);
  const [input, setInput] = useState('');

  const options = [
    { 
      text: 'Account Information', 
      icon: <AccountIcon fontSize="small" />,
      responses: [
        'Check balance',
        'Transfer money',
        'Account types'
      ]
    },
    { 
      text: 'Transactions', 
      icon: <PaymentsIcon fontSize="small" />,
      responses: [
        'Recent transactions',
        'Transaction limits',
        'Payment methods'
      ]
    },
    { 
      text: 'Loans', 
      icon: <LoanIcon fontSize="small" />,
      responses: [
        'Loan types',
        'Interest rates',
        'Application process'
      ]
    },
    { 
      text: 'Investments', 
      icon: <InvestIcon fontSize="small" />,
      responses: [
        'Investment options',
        'Current rates',
        'Risk levels'
      ]
    }
  ];

  const handleOptionClick = (option) => {
    // Add user's selection to messages
    setMessages(prev => [...prev, { text: option.text, isBot: false }]);

    // Show sub-options
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          text: `Here's what I can tell you about ${option.text}:`,
          isBot: true,
          subOptions: option.responses
        }
      ]);
    }, 500);
  };

  const handleSubOptionClick = (text) => {
    // Add user's selection to messages
    setMessages(prev => [...prev, { text, isBot: false }]);

    // Get bot response
    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages(prev => [...prev, { text: response, isBot: true, showOptions: true }]);
    }, 500);
  };

  const getBotResponse = (text) => {
    const input = text.toLowerCase();
    
    // Specific responses for each sub-option
    const responses = {
      'check balance': "You can check your balance in the Accounts section. Each account will show its current balance and recent transactions.",
      'transfer money': "To transfer money, go to the Accounts section and click the 'Transfer' button on any account card.",
      'account types': "We offer several account types: Checking, Savings, and Investment accounts. Each has its own benefits and features.",
      'recent transactions': "View all your transactions in the Transactions section. You can filter and search through your transaction history.",
      'transaction limits': "Daily transfer limits vary by account type. Checking accounts typically have a $10,000 daily limit.",
      'payment methods': "We support various payment methods including bank transfers, wire transfers, and electronic payments.",
      'loan types': "We offer Home Loans, Car Loans, and Personal Loans. Each has different terms and interest rates.",
      'interest rates': "Current loan rates start from 4.5% for home loans, 6.5% for car loans, and 9.5% for personal loans.",
      'application process': "You can apply for a loan in the Loans section. Click 'Apply for Loan' and follow the simple application process.",
      'investment options': "We offer Fixed Deposits, Mutual Funds, and Stock Market investments. Each has different risk levels and returns.",
      'current rates': "Fixed Deposit rates start at 4.5% APY. Mutual Fund and Stock Market returns vary based on market performance.",
      'risk levels': "Investment risk levels range from low (Fixed Deposits) to high (Stock Market). Choose based on your risk tolerance."
    };

    return responses[input.toLowerCase()] || "I'm not sure about that. Please select one of the available options.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      setMessages(prev => [...prev, { text: botResponse, isBot: true, showOptions: true }]);
    }, 500);
    setInput('');
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    const messageList = document.getElementById('message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Paper
              sx={{
                position: 'absolute',
                bottom: 70,
                right: 0,
                width: 320,
                height: 450,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <BotIcon />
                <Typography variant="h6">Banking Assistant</Typography>
                <IconButton 
                  size="small" 
                  sx={{ ml: 'auto', color: 'white' }}
                  onClick={() => setIsOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Messages */}
              <List
                id="message-list"
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                {messages.map((message, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.isBot ? 'flex-start' : 'flex-end',
                      padding: 0
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '80%',
                        background: message.isBot ? 'grey.100' : 'primary.main',
                        color: message.isBot ? 'text.primary' : 'white',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center'
                      }}
                    >
                      {message.isBot && (
                        <Avatar
                          sx={{ 
                            width: 24, 
                            height: 24,
                            background: 'linear-gradient(45deg, #2563eb, #7c3aed)'
                          }}
                        >
                          <BotIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      )}
                      <Typography variant="body2">{message.text}</Typography>
                    </Box>

                    {/* Show main options */}
                    {message.isBot && message.showOptions && (
                      <Stack
                        direction="column"
                        spacing={1}
                        sx={{ mt: 1, width: '100%' }}
                      >
                        {options.map((option, idx) => (
                          <Button
                            key={idx}
                            variant="outlined"
                            size="small"
                            startIcon={option.icon}
                            onClick={() => handleOptionClick(option)}
                            sx={{ 
                              justifyContent: 'flex-start',
                              borderColor: 'rgba(0,0,0,0.1)',
                              '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'rgba(37, 99, 235, 0.04)'
                              }
                            }}
                          >
                            {option.text}
                          </Button>
                        ))}
                      </Stack>
                    )}

                    {/* Show sub-options */}
                    {message.isBot && message.subOptions && (
                      <Stack
                        direction="column"
                        spacing={1}
                        sx={{ mt: 1, width: '100%' }}
                      >
                        {message.subOptions.map((subOption, idx) => (
                          <Button
                            key={idx}
                            variant="text"
                            size="small"
                            onClick={() => handleSubOptionClick(subOption)}
                            sx={{ 
                              justifyContent: 'flex-start',
                              color: 'text.secondary',
                              '&:hover': {
                                backgroundColor: 'rgba(37, 99, 235, 0.04)'
                              }
                            }}
                          >
                            {subOption}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </ListItem>
                ))}
              </List>

              {/* Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleSend}>
                        <SendIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1e40af, #5b21b6)',
          }
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </Box>
  );
}

export default ChatBot; 