const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.redirect('/map');  // Redirect to the map page by default
});


// Serve the map page at /map
app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/map/map.html'));
});

// Define a route
app.get('/hash/md5/hex', (req, res) => {
    const value = req.query.value;
    if (!value) {
        return res.status(400).send({ error: 'Missing "value" query parameter' });
    }

    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(value).digest('hex');
    res.send({ value, hash });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
