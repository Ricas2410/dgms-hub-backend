const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Admin Dashboard running at: http://localhost:${PORT}`);
    console.log(`📱 Mobile-friendly and ready to test!`);
});
