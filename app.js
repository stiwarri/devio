const bodyParser = require('body-parser');
const express = require('express');

const authRoutes = require('./routes/auth.routes');
const postsRoutes = require('./routes/posts.routes');
const profileRoutes = require('./routes/profile.routes');
const connectDB = require('./config/db');
const errorHandlerMiddleware = require('./middlewares/error-handler');

const PORT = process.env.PORT || 5000;
const app = express();

// Initial middlewares
app.use(bodyParser.json({ extended: false }));

// Route middlewares
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/posts', postsRoutes);

// Global error-handler middleware
app.use(errorHandlerMiddleware);

// Connect to DB and start server
connectDB(() => {
    app.listen(PORT, () => {
        console.log(`Node.js server is running on port ${PORT}.`);
    });
});