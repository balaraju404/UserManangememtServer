const express = require('express');
const cors = require('cors');
const router = require('./router/routing');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routing
app.use(router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing server and database connection...');
    // Assuming connection object is imported from another file
    connection.end(() => {
        console.log('Database connection closed');
        process.exit(0);
    });
});

// Server start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
