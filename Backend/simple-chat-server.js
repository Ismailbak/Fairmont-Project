const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple responses for testing
const responses = {
  'hi': 'Hello! How can I help you with Fairmont services today?',
  'hello': 'Hello! Welcome to Fairmont. How can I assist you?',
  'spa': 'Our spa is open daily from 10:00 AM to 8:00 PM. Would you like to book a treatment?',
  'security': 'Our security team is available 24/7. All rooms have safes for your valuables.',
  'booking': 'You can book spa treatments by phone, at reception, or using your mobile device.',
  'facilities': 'We offer spa, gym, pool, jacuzzi, hammam, and sauna facilities.'
};

// Chat endpoint
app.post('/api/chat', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase();
    let response = 'I can help you with spa services, security, bookings, and facilities. What would you like to know?';
    
    // Simple keyword matching
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      response = responses.hi;
    } else if (lowerMessage.includes('spa')) {
      response = responses.spa;
    } else if (lowerMessage.includes('security')) {
      response = responses.security;
    } else if (lowerMessage.includes('book')) {
      response = responses.booking;
    } else if (lowerMessage.includes('facility')) {
      response = responses.facilities;
    }
    
    res.json({
      success: true,
      context: response,
      originalMessage: message
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple chat server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`API available at http://10.16.21.177:${PORT}`);
}); 