const http = require('http');
const mongoose = require('mongoose');
const url = require('url');
const querystring = require('querystring');

// Get MongoDB URI from environment variables
const mongodbUri = process.env.MONGODB_URI;

// MongoDB connection setup
mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, // Ensure SSL is enabled
  sslValidate: false, // For compatibility with older TLS versions
  tlsAllowInvalidCertificates: true, // Optional: allows invalid certificates (use with caution)
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Basic Stock Schema (for example purposes)
const Stock = mongoose.model('Stock', {
  ticker: String,
  name: String,
  price: Number,
});

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  // Handle root (home) page
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Welcome to the Stock Ticker App</h1>
      <form action="/process" method="GET">
        <label>Enter ticker symbol or company name:</label>
        <input type="text" name="query" required />
        <br>

        <label><input type="radio" name="searchType" value="ticker" checked /> Ticker symbol</label>
        <label><input type="radio" name="searchType" value="name" /> Company name</label>
        <br>

        <button type="submit">Search</button>
      </form>
    `);
  }
  // Handle /process route (stock search)
  else if (req.method === 'GET' && req.url.startsWith('/process')) {
    const queryObject = url.parse(req.url, true).query;
    const query = queryObject.query;
    const searchType = queryObject.searchType;

    // Here you would query MongoDB based on the searchType
    // For simplicity, we'll simulate a response with mock data
    if (searchType === 'ticker') {
      Stock.find({ ticker: query }, (err, result) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database query error' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ result }));
        }
      });
    } else if (searchType === 'name') {
      Stock.find({ name: query }, (err, result) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database query error' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ result }));
        }
      });
    } else {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid search type' }));
    }
  }
  // Handle 404 for other routes
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>Page Not Found</h1>');
  }
});

// Listen on port 3000 or the Heroku-assigned port
server.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
