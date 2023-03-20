const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import middleware
const { authenticateJWT } = require("./middleware/authentication");
const requestLog = require("./middleware/logging");
const { createModelsMiddleware, disconnectFromDatababaseMiddleware } = require("./middleware/models");

// Import routes
const datasets = require("./routes/datasets");
const groups = require("./routes/groups");
const session = require("./routes/session");
const users = require('./routes/users');

const app = express();
const port = 8000;

// Use middleware
app.use(cors());
app.use(createModelsMiddleware);
app.use(requestLog);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Testing health route
app.get("/health", (req, res, next) => {
    const result = {status: "up", port};
    res.json(result);
    next();
});

// Use routes
app.use("/datasets", datasets);
app.use("/groups", groups);
app.use("/session", session);
app.use("/users", users);

app.listen(port, () => {
    console.log(`This app is listening on port ${ port }`);
});