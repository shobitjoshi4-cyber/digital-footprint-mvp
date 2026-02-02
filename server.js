require("dotenv").config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Database
const db = new sqlite3.Database("./db.sqlite");

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  worry TEXT,
  behavior TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// API endpoint
app.post("/signup", (req, res) => {
  const { email, worry, behavior } = req.body;

  db.run(
    `INSERT INTO users (email, worry, behavior) VALUES (?, ?, ?)`,
    [email, worry, behavior]
  );

  sendReportEmail(email);

  res.json({ success: true });
});

// Send report email
function sendReportEmail(email) {
  const riskScore = Math.floor(Math.random() * 40) + 60;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Digital Exposure Summary",
    html: `
      <h2>Your Digital Footprint Snapshot</h2>
      <p>Most people accumulate:</p>
      <ul>
        <li>100+ online accounts</li>
        <li>30–40 inactive services</li>
        <li>High-risk categories (finance, social, AI tools)</li>
      </ul>
      <h3>Digital Exposure Score: ${riskScore}/100</h3>
      <p>Awareness is the first step. Cleanup comes next.</p>
      <a href="https://yourfutureapp.com">Get early access to the app</a>
      <br/><br/>
      <small>No inbox accessed. No passwords stored.</small>
    `
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) console.log("Email error:", err);
  });
}

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

