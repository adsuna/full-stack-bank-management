require('dotenv').config();

if (!process.env.JWT_SECRET || !process.env.MONGODB_URI || !process.env.MYSQL_PASSWORD) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');

const app = express()

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
})

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err)
  } else {
    console.log("Connected to MySQL database")
  }
})

// Update the MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB Atlas");
}).catch((error) => {
  console.error("MongoDB Atlas connection error:", error);
});

// Create Review Schema
const reviewSchema = new mongoose.Schema({
  name: String,
  rating: Number,
  comment: String,
  date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  const { name, phoneNumber, password, email } = req.body;
  
  // Start a transaction since we're doing multiple operations
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }

    try {
      // First create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertUserQuery = "INSERT INTO users (phone_number, name, password, email) VALUES (?, ?, ?, ?)";
      await db.promise().query(insertUserQuery, [phoneNumber, name, hashedPassword, email]);
      
      // Then create a default checking account for them
      const insertAccountQuery = "INSERT INTO accounts (user_phone, account_type, balance) VALUES (?, 'Checking', 0.00)";
      await db.promise().query(insertAccountQuery, [phoneNumber]);

      // If everything worked, commit the transaction
      await db.promise().commit();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      await db.promise().rollback();
      res.status(500).json({ error: "Error registering user" });
    }
  });
})

app.post("/api/auth/login", async (req, res) => {
  const { phoneNumber, password } = req.body;

  const query = "SELECT * FROM users WHERE phone_number = ?";
  db.query(query, [phoneNumber], async (err, results) => {
    if (err || results.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = jwt.sign({ phoneNumber: user.phone_number }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  });
})

// Protected Routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.get("/api/accounts/balance", authenticateToken, (req, res) => {
  const query = "SELECT balance FROM accounts WHERE user_phone = ? LIMIT 1";
  db.query(query, [req.user.phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching balance" });
    } else if (results.length === 0) {
      res.json({ balance: 0.00 }); // Return 0 if no account exists
    } else {
      res.json({ balance: results[0].balance });
    }
  });
})

app.get("/api/transactions/recent", authenticateToken, (req, res) => {
  const query = "SELECT * FROM transactions WHERE user_phone = ? ORDER BY date DESC LIMIT 5"
  db.query(query, [req.user.phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching recent transactions" })
    } else {
      res.json({ transactions: results })
    }
  })
})

// Accounts Routes
app.get("/api/accounts", authenticateToken, (req, res) => {
  const query = `
    SELECT id, account_type, balance, created_at 
    FROM accounts 
    WHERE user_phone = ?
  `;
  
  db.query(query, [req.user.phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching accounts" });
    } else {
      res.json({ accounts: results });
    }
  });
});

app.post("/api/accounts/transfer", authenticateToken, (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  
  // Start transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }

    try {
      // Check if sender has sufficient balance
      const checkBalance = "SELECT balance FROM accounts WHERE id = ? AND user_phone = ?";
      const [[account]] = await db.promise().query(checkBalance, [fromAccountId, req.user.phoneNumber]);
      
      if (!account || account.balance < amount) {
        throw new Error("Insufficient funds");
      }

      // Update sender's account
      await db.promise().query(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        [amount, fromAccountId]
      );

      // Update receiver's account
      await db.promise().query(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [amount, toAccountId]
      );

      // Record transaction
      await db.promise().query(
        `INSERT INTO transactions 
         (user_phone, from_account_id, to_account_id, amount, type, description) 
         VALUES (?, ?, ?, ?, 'TRANSFER', 'Money Transfer')`,
        [req.user.phoneNumber, fromAccountId, toAccountId, amount]
      );

      // Commit transaction
      await db.promise().commit();
      res.json({ message: "Transfer successful" });
    } catch (error) {
      await db.promise().rollback();
      res.status(400).json({ error: error.message });
    }
  });
});

// Create a new transaction
app.post("/api/transactions/create", authenticateToken, async (req, res) => {
  const { fromAccountId, toAccountId, amount, description, transactionType } = req.body;

  // Start transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }

    try {
      // For transfers, verify account ownership and sufficient balance
      if (transactionType === 'transfer' && fromAccountId) {
        const checkAccount = "SELECT balance FROM accounts WHERE id = ? AND user_phone = ?";
        const [[fromAccount]] = await db.promise().query(checkAccount, [fromAccountId, req.user.phoneNumber]);

        if (!fromAccount) {
          throw new Error("Account not found or unauthorized");
        }

        if (fromAccount.balance < amount) {
          throw new Error("Insufficient funds");
        }

        // Update sender's balance
        await db.promise().query(
          "UPDATE accounts SET balance = balance - ? WHERE id = ?",
          [amount, fromAccountId]
        );

        // Update receiver's balance if it's an internal transfer
        if (toAccountId) {
          await db.promise().query(
            "UPDATE accounts SET balance = balance + ? WHERE id = ?",
            [amount, toAccountId]
          );
        }
      } 
      // For deposits, update receiving account
      else if (transactionType === 'deposit' && toAccountId) {
        await db.promise().query(
          "UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_phone = ?",
          [amount, toAccountId, req.user.phoneNumber]
        );
      }
      // For withdrawals, update source account
      else if (transactionType === 'withdrawal' && fromAccountId) {
        const [[account]] = await db.promise().query(
          "SELECT balance FROM accounts WHERE id = ? AND user_phone = ?",
          [fromAccountId, req.user.phoneNumber]
        );

        if (!account || account.balance < amount) {
          throw new Error("Insufficient funds");
        }

        await db.promise().query(
          "UPDATE accounts SET balance = balance - ? WHERE id = ?",
          [amount, fromAccountId]
        );
      }

      // Record the transaction
      await db.promise().query(
        `INSERT INTO transactions 
         (user_phone, from_account_id, to_account_id, amount, transaction_type, description) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.user.phoneNumber, fromAccountId, toAccountId, amount, transactionType, description]
      );

      await db.promise().commit();
      res.json({ message: "Transaction successful" });
    } catch (error) {
      await db.promise().rollback();
      res.status(400).json({ error: error.message });
    }
  });
});

// Get transaction history with pagination
app.get("/api/transactions", authenticateToken, (req, res) => {
  const { page = 0, limit = 10 } = req.query;
  const offset = page * limit;

  const query = `
    SELECT t.*, 
           a1.account_type as from_account_type,
           a2.account_type as to_account_type
    FROM transactions t
    LEFT JOIN accounts a1 ON t.from_account_id = a1.id
    LEFT JOIN accounts a2 ON t.to_account_id = a2.id
    WHERE t.user_phone = ?
    ORDER BY t.date DESC
    LIMIT ? OFFSET ?
  `;

  // Get total count for pagination
  const countQuery = "SELECT COUNT(*) as total FROM transactions WHERE user_phone = ?";
  
  db.query(countQuery, [req.user.phoneNumber], (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: "Error counting transactions" });
    }

    db.query(query, [req.user.phoneNumber, parseInt(limit), parseInt(offset)], (err, results) => {
      if (err) {
        res.status(500).json({ error: "Error fetching transactions" });
      } else {
        res.json({
          transactions: results,
          total: countResult[0].total,
          page: parseInt(page),
          totalPages: Math.ceil(countResult[0].total / limit)
        });
      }
    });
  });
});

// Create a new account
app.post("/api/accounts/create", authenticateToken, (req, res) => {
  const { accountType } = req.body;
  
  const query = "INSERT INTO accounts (user_phone, account_type, balance) VALUES (?, ?, 0.00)";
  db.query(query, [req.user.phoneNumber, accountType], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error creating account" });
    } else {
      res.status(201).json({ 
        message: "Account created successfully",
        accountId: result.insertId 
      });
    }
  });
});

// Get all accounts for user
app.get("/api/accounts/all", authenticateToken, (req, res) => {
  const query = `
    SELECT 
      id, 
      account_type, 
      CAST(balance AS DECIMAL(10,2)) as balance, 
      created_at 
    FROM accounts 
    WHERE user_phone = ?
  `;
  
  db.query(query, [req.user.phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching accounts" });
    } else {
      // Parse balance to number before sending
      const accounts = results.map(account => ({
        ...account,
        balance: parseFloat(account.balance)
      }));
      res.json({ accounts });
    }
  });
});

// Get transaction history
app.get("/api/transactions/history", authenticateToken, (req, res) => {
  const { page = 0, limit = 10 } = req.query;
  const offset = page * limit;

  const query = `
    SELECT t.*, 
           a1.account_type as from_account_type,
           a2.account_type as to_account_type
    FROM transactions t
    LEFT JOIN accounts a1 ON t.from_account_id = a1.id
    LEFT JOIN accounts a2 ON t.to_account_id = a2.id
    WHERE t.user_phone = ?
    ORDER BY t.date DESC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [req.user.phoneNumber, parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching transactions" });
    } else {
      res.json({ transactions: results });
    }
  });
});

// Investment Routes
app.get("/api/investments", authenticateToken, (req, res) => {
  const query = `
    SELECT 
      id, 
      investment_type, 
      CAST(amount AS DECIMAL(10,2)) as amount,
      CAST(interest_rate AS DECIMAL(5,2)) as interest_rate,
      term_months,
      status,
      created_at
    FROM investments 
    WHERE user_phone = ?
  `;
  
  db.query(query, [req.user.phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching investments" });
    } else {
      const investments = results.map(investment => ({
        ...investment,
        amount: parseFloat(investment.amount),
        interest_rate: parseFloat(investment.interest_rate)
      }));
      res.json({ investments });
    }
  });
});

app.post("/api/investments/create", authenticateToken, async (req, res) => {
  const { investmentType, amount, termMonths, interestRate } = req.body;
  
  const query = `
    INSERT INTO investments 
    (user_phone, investment_type, amount, term_months, interest_rate, status) 
    VALUES (?, ?, ?, ?, ?, 'active')
  `;
  
  db.query(
    query, 
    [req.user.phoneNumber, investmentType, amount, termMonths || null, interestRate || null],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Error creating investment" });
      } else {
        res.status(201).json({ 
          message: "Investment created successfully",
          investmentId: result.insertId 
        });
      }
    }
  );
});

// Add funds to investment
app.post("/api/investments/add-funds", authenticateToken, async (req, res) => {
  const { investmentId, accountId, amount } = req.body;
  
  console.log('Received add funds request:', { investmentId, accountId, amount });

  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }

    try {
      // Check if account has sufficient funds
      const [[account]] = await db.promise().query(
        "SELECT balance FROM accounts WHERE id = ? AND user_phone = ?",
        [accountId, req.user.phoneNumber]
      );

      if (!account || account.balance < amount) {
        throw new Error("Insufficient funds in account");
      }

      // Deduct from account
      await db.promise().query(
        "UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_phone = ?",
        [amount, accountId, req.user.phoneNumber]
      );

      // Add to investment
      await db.promise().query(
        "UPDATE investments SET amount = amount + ? WHERE id = ? AND user_phone = ?",
        [amount, investmentId, req.user.phoneNumber]
      );

      // Create transaction record - using 'transfer' type instead of 'investment'
      await db.promise().query(
        "INSERT INTO transactions (user_phone, from_account_id, transaction_type, amount, description) VALUES (?, ?, 'transfer', ?, 'Investment deposit')",
        [req.user.phoneNumber, accountId, amount]
      );

      await db.promise().commit();
      res.json({ message: "Funds added successfully" });
    } catch (error) {
      console.error('Error in add funds:', error);
      await db.promise().rollback();
      res.status(500).json({ error: error.message || "Error adding funds" });
    }
  });
});

// Withdraw from investment
app.post("/api/investments/withdraw", authenticateToken, async (req, res) => {
  const { investmentId, accountId, amount } = req.body;
  
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }

    try {
      // Check if investment has sufficient funds
      const [[investment]] = await db.promise().query(
        "SELECT amount FROM investments WHERE id = ? AND user_phone = ?",
        [investmentId, req.user.phoneNumber]
      );

      if (!investment || investment.amount < amount) {
        throw new Error("Insufficient funds in investment");
      }

      // Deduct from investment
      await db.promise().query(
        "UPDATE investments SET amount = amount - ? WHERE id = ? AND user_phone = ?",
        [amount, investmentId, req.user.phoneNumber]
      );

      // Add to account
      await db.promise().query(
        "UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_phone = ?",
        [amount, accountId, req.user.phoneNumber]
      );

      // Create transaction record
      await db.promise().query(
        "INSERT INTO transactions (user_phone, to_account_id, transaction_type, amount, description) VALUES (?, ?, 'withdrawal', ?, 'Investment withdrawal')",
        [req.user.phoneNumber, accountId, amount]
      );

      await db.promise().commit();
      res.json({ message: "Withdrawal successful" });
    } catch (error) {
      await db.promise().rollback();
      res.status(500).json({ error: error.message || "Error processing withdrawal" });
    }
  });
});

// Loan Routes
app.get("/api/loans", authenticateToken, (req, res) => {
  const query = `
    SELECT 
      id, 
      loan_type, 
      CAST(amount AS DECIMAL(10,2)) as amount,
      CAST(interest_rate AS DECIMAL(5,2)) as interest_rate,
      term_months,
      status,
      created_at,
      next_due_date
    FROM loans 
    WHERE user_phone = ?
  `;
  
  db.query(query, [req.user.phoneNumber], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching loans" });
    } else {
      const loans = results.map(loan => ({
        ...loan,
        amount: parseFloat(loan.amount),
        interest_rate: parseFloat(loan.interest_rate)
      }));
      res.json({ loans });
    }
  });
});

app.post("/api/loans/apply", authenticateToken, async (req, res) => {
  const { loanType, amount, termMonths, purpose } = req.body;
  
  // Calculate a sample interest rate based on loan type
  const getInterestRate = (type) => {
    switch (type) {
      case 'home': return 4.5;
      case 'car': return 6.5;
      case 'personal': return 9.5;
      default: return 10.0;
    }
  };

  const interestRate = getInterestRate(loanType);
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  const query = `
    INSERT INTO loans 
    (user_phone, loan_type, amount, interest_rate, term_months, next_due_date, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
  
  db.query(
    query, 
    [req.user.phoneNumber, loanType, amount, interestRate, termMonths, nextDueDate],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Error applying for loan" });
      } else {
        res.status(201).json({ 
          message: "Loan application submitted successfully",
          loanId: result.insertId 
        });
      }
    }
  );
});

// Add this new endpoint
app.get("/api/transactions/summary", authenticateToken, (req, res) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const query = `
    SELECT 
      SUM(CASE WHEN transaction_type = 'deposit' THEN amount ELSE 0 END) as monthly_income,
      SUM(CASE WHEN transaction_type = 'withdrawal' THEN amount ELSE 0 END) as monthly_spending,
      COUNT(*) as recent_count
    FROM transactions 
    WHERE user_phone = ? 
    AND created_at >= ?
  `;

  db.query(query, [req.user.phoneNumber, monthStart], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error fetching transaction summary" });
    } else {
      res.json({
        monthlyIncome: results[0].monthly_income || 0,
        monthlySpending: results[0].monthly_spending || 0,
        recentCount: results[0].recent_count || 0
      });
    }
  });
});

// Add these endpoints
app.post("/api/reviews", async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Error creating review" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).limit(10);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

// MongoDB Connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("MongoDB Atlas connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

// Call the connect function
connectDB();

// Add error handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

