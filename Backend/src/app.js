
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Allow local development and the deployed frontend.
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin(origin, callback) {
            // Allow requests without an Origin header, such as
            // server-to-server requests and local health checks.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    })
);

// Health check for deployment verification.
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Import routes.
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// Register routes.
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
