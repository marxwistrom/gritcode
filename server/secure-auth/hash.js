const bcrypt = require('bcrypt');
const [, , password] = process.argv
if (!password) {
    console.error('Usage: node hash.js <password>');
    process.exit(1);
}
bcrypt.hash(password, 12).then(hash => {
    console.log('Bcrypt hash:\n', hash)
    process.exit(0);
});