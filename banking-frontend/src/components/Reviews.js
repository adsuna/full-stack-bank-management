import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Rating,
  TextField,
  Button,
  Box,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/reviews', newReview);
      setNewReview({ name: '', rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
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
          Customer Reviews
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          See what our customers are saying about us
        </Typography>
      </Box>

      {/* Review Form */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 6,
          background: 'linear-gradient(135deg, #60a5fa10, #7c3aed10)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Share Your Experience
        </Typography>
        <Box component="form" onSubmit={handleSubmitReview}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Name"
                value={newReview.name}
                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography component="legend">Rating:</Typography>
                <Rating
                  value={newReview.rating}
                  onChange={(e, newValue) => setNewReview({ ...newReview, rating: newValue })}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e40af, #5b21b6)',
                  }
                }}
              >
                Submit Review
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Reviews List */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {reviews.map((review, index) => (
            <Grid item xs={12} md={6} key={review._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #60a5fa05, #7c3aed05)',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {review.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(review.date), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Rating
                        value={review.rating}
                        readOnly
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>
    </Container>
  );
}

export default Reviews; 