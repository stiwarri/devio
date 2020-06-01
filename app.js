const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const postsRoutes = require('./routes/posts.routes');
const connectDB = require('./config/db');
const checkAuthMiddleware = require('./middlewares/check-auth');
const errorHandlerMiddleware = require('./middlewares/error-handler');

const PORT = process.env.PORT || 5000;
const app = express();

// Initial middlewares
app.use(bodyParser.json({ extended: false }));

// Route middlewares
app.use('/auth', authRoutes);
app.use('/profile', checkAuthMiddleware, profileRoutes);
app.use('/posts', postsRoutes);

// Global error-handler middleware
app.use(errorHandlerMiddleware);

// Connect to DB and start server
connectDB(() => {
    app.listen(PORT, () => {
        console.log(`Node.js server is running on port ${PORT}.`);
    });
});