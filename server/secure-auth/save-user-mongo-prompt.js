require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');
const User = require('./models/User');

const SALT_ROUNDS = 12;

function ask(question, hide = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (hide) {
      rl.stdoutMuted = true;
      rl._writeToOutput = function _writeToOutput(stringToWrite) {
        if (rl.stdoutMuted) rl.output.write('*');
        else rl.output.write(stringToWrite);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

(async () => {
  const username = await ask('Username: ');
  const password = await ask('Password: ', true);
  const role = await ask('\nRole (press enter for user): ');
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.findOneAndUpdate(
      { username },
      { $set: { passwordHash, role: role || 'user' }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true }
    );
    console.log('\nAnvändare skapad/uppdaterad:', { id: user._id.toString(), username: user.username, role: user.role });
  } catch (err) {
    console.error('Fel:', err);
  } finally {
    await mongoose.disconnect();
  }
})();
