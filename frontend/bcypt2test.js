const bcrypt = require('bcrypt');
const password = 'password123';
const hash = '$2b$10$8dcPEBB9wwVKPWpRL812hujCGs9a6orOlqbJ5qtl0vRKJqflMAeyO'; // Replace with the actual hash from your DB

bcrypt.compare(password, hash, (err, result) => {
    if (result) {
        console.log('Password matches!');
    } else {
        console.log('Password does NOT match.');
    }
});
