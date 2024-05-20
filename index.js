const express = require('express');
const cors = require('cors');
const router = require('./src/router/routing');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routing
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello World');
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});


// Server start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
