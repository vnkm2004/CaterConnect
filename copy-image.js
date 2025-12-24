const fs = require('fs');
const path = require('path');

const source = 'C:\\Users\\vishw\\.gemini\\antigravity\\brain\\52058130-f2eb-409e-a15a-84504a60babd\\login_illustration_1766149219430.png';
const dest = path.join(__dirname, 'assets', 'images', 'login-illustration.png');

try {
    fs.copyFileSync(source, dest);
    console.log('Image copied successfully!');
} catch (error) {
    console.error('Error copying image:', error);
}
