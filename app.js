// source: https://www.w3schools.com/nodejs/nodejs_mongodb_find.asp
// source: https://www.w3schools.com/nodejs/met_path_dirname.asp

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
const { MongoClient } = require('mongodb');

const connStr = "mongodb+srv://shivaniparekh:Doofferb18%24@cluster0.b0k69lf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(connStr);
const PORT = process.env.PORT || 3000;

http.createServer(async function (req, res) {
    const urlObj = url.parse(req.url, true);

    // home view
    if (req.method === 'GET' && urlObj.pathname === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, content) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } 
    // process view
    else if (req.method === 'GET' && urlObj.pathname === '/process') {
        const queryParam = urlObj.query.query; // what they searched for
        const searchType = urlObj.query.searchType; // search type of 'company' or 'ticker'

        // set the search type
        let searchQuery;
        if (searchType === 'name') {
            searchQuery = { company: queryParam};
        } else if (searchType === 'ticker') {
            searchQuery = { ticker: queryParam};
        }

        // output search to console log
        console.log('MongoDB Query:', searchQuery); 

        try {
            await client.connect();
            const db = client.db("Stock");
            const collection = db.collection("PublicCompanies");

            // for searching
            const results = await collection.find(searchQuery).toArray();

            // output search results to console log and to html web page
            let html = `<h1>Search Results</h1>`;
            if (results.length > 0) {
                results.forEach(item => {
                    console.log(`Company: ${item.company}, Ticker: ${item.ticker}, Price: $${item.price}`);
                    html += `<p><strong>${item.company}</strong> (${item.ticker}) - $${item.price}</p>`;
                });
            } else {
                console.log("No results found.");
                html += "<p>No results found.</p>";
            }

            // reset
            html += `<br><a href="/">Back to search</a>`;

            // send response to browser
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);

        } finally {
            await client.close();
        }
    } else {
        // error if something went wrong
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<p>Page not found.</p>');
    }
}).listen(PORT);