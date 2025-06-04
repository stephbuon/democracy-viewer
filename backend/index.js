const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Delete old files to prevent clutter
const cleanup = require("./cleanup");
setInterval(cleanup, 3600000);

// Import middleware
const requestLog = require("./middleware/logging");
const { createDatabaseConnection, deleteDatabaseConnection } = require("./middleware/databases");
const { optAuthenticateJWT } = require("./middleware/authentication");

// Import routes
// const databases = require("./routes/databases");
const datasets = require("./routes/datasets");
const graphs = require("./routes/graphs");
// const groups = require("./routes/groups");
const session = require("./routes/session");
const users = require('./routes/users');

const app = express();
const port = 8000;

// Use middleware
app.use(cors({
    origin: process.env.FRONTEND_ENDPOINT,
    optionsSuccessStatus: 200
}));

// Increase server timeout for large uploads (30 minutes)
app.use((req, res, next) => {
    req.setTimeout(1800000);
    res.setTimeout(1800000);
    next();
});

app.use(requestLog);
app.use(optAuthenticateJWT);
app.use(createDatabaseConnection);

// Increase body parser limits for uploading large datasets - different limits for different routes
app.use('/datasets', bodyParser.json({ limit: "20gb" }));
app.use('/datasets', bodyParser.urlencoded({ 
    limit: "20gb", 
    extended: true, 
    parameterLimit: 1000000 
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// Define api prefix if necessary
let apiPrefix = "";
if (process.env.API_PREFIX) {
    apiPrefix = process.env.API_PREFIX;
}

// Testing health route
app.get("/health", async(req, res, next) => {
    await req.knex.raw("SELECT 1");
    const result = {status: "up", port};
    res.json(result);
    next();
});

// Use routes
// app.use("/distributed", databases);
app.use(`${ apiPrefix }/datasets`, datasets);
app.use(`${ apiPrefix }/graphs`, graphs);
// app.use(`${ apiPrefix }/groups`, groups);
// app.use(`${ apiPrefix }/preprocessing`, preprocessing);
app.use(`${ apiPrefix }/session`, session);
app.use(`${ apiPrefix }/users`, users);

// Error handling middleware for large uploads
app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'File too large',
            message: 'The uploaded file exceeds the maximum allowed size'
        });
    }
    
    if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
        return res.status(408).json({
            error: 'Upload timeout',
            message: 'Upload took too long and was cancelled'
        });
    }
    
    // Ensure CORS headers are sent even on errors
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_ENDPOINT);
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Delete knex connection
app.use(deleteDatabaseConnection);

const server = app.listen(port, () => {
    console.log(`This app is listening on port ${port}`);
});

// Increase server timeout globally
server.timeout = 1800000; // 30 minutes
server.keepAliveTimeout = 1800000;
server.headersTimeout = 1800000;