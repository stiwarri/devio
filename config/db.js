const config = require('config');
const mongoose = require('mongoose');

const mongoURI = config.get('mongoURI');

const connectDB = async cb => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected to MongoDB.');
        cb();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;