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
app.use(requestLog);
app.use(optAuthenticateJWT);
app.use(createDatabaseConnection);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// Testing health route
app.get("/health", async(req, res, next) => {
    await req.knex.raw("SELECT 1");
    const result = {status: "up", port};
    res.json(result);
    next();
});

// Use routes
// app.use("/distributed", databases);
app.use("/datasets", datasets);
app.use("/graphs", graphs);
// app.use("/groups", groups);
// app.use("/preprocessing", preprocessing);
app.use("/session", session);
app.use("/users", users);

// Delete knex connection
app.use(deleteDatabaseConnection);

app.listen(port, () => {
    console.log(`This app is listening on port ${ port }`);
});