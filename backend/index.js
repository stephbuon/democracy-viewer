const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import middleware
const requestLog = require("./middleware/logging");
const { createDatabaseConnection, deleteDatabaseConnection } = require("./middleware/databases");
// const { createModelsMiddleware, disconnectFromDatababaseMiddleware } = require("./middleware/models");

// Import routes
const databases = require("./routes/databases");
const datasets = require("./routes/datasets");
const graphs = require("./routes/graphs");
const groups = require("./routes/groups");
// const preprocessing = require("./routes/preprocessing");
const session = require("./routes/session");
const users = require('./routes/users');

const app = express();
const port = 8000;

// Use middleware
app.use(cors());
// app.use(createModelsMiddleware);
app.use(requestLog);
app.use(createDatabaseConnection);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

// Testing health route
app.get("/health", (req, res, next) => {
    const result = {status: "up", port};
    res.json(result);
    next();
});

// Use routes
app.use("/databases", databases);
app.use("/datasets", datasets);
app.use("/graphs", graphs);
app.use("/groups", groups);
// app.use("/preprocessing", preprocessing);
app.use("/session", session);
app.use("/users", users);

// Delete knex connection
app.use(createDatabaseConnection);

app.listen(port, () => {
    console.log(`This app is listening on port ${ port }`);
});