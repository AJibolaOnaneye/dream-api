// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import authRoute from "./routes/auth.route.js";
// import postRoute from "./routes/post.route.js";
// import testRoute from "./routes/test.route.js";
// import userRoute from "./routes/user.route.js";
// import chatRoute from "./routes/chat.route.js";
// import messageRoute from "./routes/message.route.js";

// const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());
// app.use(cookieParser());

// app.use("/api/auth", authRoute);
// app.use("/api/users", userRoute);
// app.use("/api/posts", postRoute);
// app.use("/api/test", testRoute);
// app.use("/api/chats", chatRoute);
// app.use("/api/messages", messageRoute);


// app.listen(8800, () => {
//   console.log("Server is running!");
// });



import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet"; // Add this for basic security

import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";

const app = express();

const PORT = process.env.PORT || 8800;

// Basic security with helmet
app.use(helmet());

// CORS configuration
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Middleware to parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
