const https = require('https');

const url = 'https://modovate-backend.onrender.com/api/auth/csrf-token'; // Backend URL

function ping() {
  https.get(url, (res) => {
    console.log(`Pinged backend: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Error pinging backend:', err.message);
  });
}

// Pinguje na svakih 5 minuta
setInterval(ping, 5 * 60 * 1000);

// Pošalje ping odmah kad se pokrene
ping();
