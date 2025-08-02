const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Fairmont Backend API is running!' });
});

// Chat endpoint that uses the Python retriever
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call Python retriever
    const options = {
      mode: 'text',
      pythonPath: 'python', // or 'python3' depending on your system
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: __dirname,
      args: [message]
    };

    PythonShell.run('retriever.py', options, (err, results) => {
      if (err) {
        console.error('Python script error:', err);
        return res.status(500).json({ 
          error: 'Failed to process request',
          details: err.message 
        });
      }

      // The Python script should return the context
      const context = results ? results.join('\n') : 'No relevant information found.';
      
      res.json({
        success: true,
        context: context,
        originalMessage: message
      });
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
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`API available at http://10.16.21.177:${PORT}`);
}); 