var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
const { MongoClient } = require('mongodb');

// Using environment variable for MongoDB URI
const connStr = process.env.MONGO_URI;
const client = new MongoClient(connStr);
const PORT = process.env.PORT || 3000;

let db;

// Initialize MongoDB connection
async function initDb() {
    try {
        await client.connect();
        db = client.db('Stock');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Call the initDb function to establish the MongoDB connection at startup
initDb();

http.createServer(async function (req, res) {
    const urlObj = url.parse(req.url, true);

    // Home view
    if (req.method === 'GET' && urlObj.pathname === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<p>Error loading the home page.</p>');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } 
    // Process view (search results)
    else if (req.method === 'GET' && urlObj.pathname === '/process') {
        const queryParam = urlObj.query.query; // Search query
        const searchType = urlObj.query.searchType; // 'name' or 'ticker'

        let searchQuery;
        if (searchType === 'name') {
            searchQuery = { company: queryParam };
        } else if (searchType === 'ticker') {
            searchQuery = { ticker: queryParam };
        }

        console.log('MongoDB Query:', searchQuery); 

        try {
            // Query MongoDB for the results
            const collection = db.collection('PublicCompanies');
            const results = await collection.find(searchQuery).toArray();

            let html = `<h1>Search Results</h1>`;
            if (results.length > 0) {
                results.forEach(item => {
                    html += `<p><strong>${item.company}</strong> (${item.ticker}) - $${item.price}</p>`;
                });
            } else {
                html += "<p>No results found.</p>";
            }
            html += `<br><a href="/">Back to search</a>`;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);

        } catch (error) {
            console.error('MongoDB query error:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<p>Internal server error occurred.</p>');
        }
    } else {
        // Handle 404 errors
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<p>Page not found.</p>');
    }
}).listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
