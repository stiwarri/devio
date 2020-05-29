const express = require('express');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const postsRoutes = require('./routes/posts.routes');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const app = express();

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/posts', postsRoutes);

// Connect to DB and start server
connectDB(() => {
    app.listen(PORT, () => {
        console.log(`Node.js server is running on port ${PORT}.`);
    });
});