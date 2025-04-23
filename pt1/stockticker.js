// source: https://www.w3schools.com/nodejs/ref_readline.asp

const fs = require('fs');
const readline = require('readline');
const { MongoClient } = require('mongodb');

const connStr = "mongodb+srv://shivaniparekh:Doofferb18$@cluster0.b0k69lf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(connStr);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected successfully!");

        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        // create a read stream for the csv file
        const interface = readline.createInterface({
            input: fs.createReadStream("companies.csv"),
        });

        // to track the first line
        let first = true;

        // read/process one line at a time
        for await (const line of interface) { 
            // skip the first line bc it is just the column names 
            if (first) {
                first = false; // not on the first line anymore
                continue; // so keep going
            }

            // output line
            console.log(`On line ${line}`);
            
            // split the line by its column categories
            const [name, ticker, price] = line.split(',');

            // make a document with the categories
            const document = {
                company: name,
                ticker: ticker,
                price: parseFloat(price)
            };

            // put the document in the collection
            await collection.insertOne(document);
        }
    } catch (err) {
        console.error("Connection failed: ", err);
    } finally {
        await client.close();
    }
}

connectDB();