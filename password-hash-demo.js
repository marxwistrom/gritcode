// Password Hashing Demonstration
import bcrypt from 'bcrypt';

async function demonstratePasswordHashing() {
    console.log('🔐 PASSWORD HASHING DEMONSTRATION\n');

    const plainPassword = 'AdminSecure2025!';
    console.log('📝 Original Password:', plainPassword);
    console.log('⚠️  NEVER store plain passwords!\n');

    // Hash the password
    console.log('🔄 Hashing password with bcrypt...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    console.log('✅ Hashed Password:', hashedPassword);
    console.log('📏 Hash Length:', hashedPassword.length, 'characters\n');

    // Verify the password
    console.log('🔍 Verifying password against hash...');
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);

    console.log('✅ Correct password verification:', isValid);
    console.log('❌ Wrong password verification:', isInvalid);
    console.log('');

    // Show hash components
    console.log('🔧 Hash Analysis:');
    console.log('- Algorithm: bcrypt');
    console.log('- Salt Rounds:', saltRounds);
    console.log('- Salt is embedded in hash');
    console.log('- Each hash is unique (even for same password)');
    console.log('');

    // Demonstrate different salts
    console.log('🎲 Demonstrating unique hashes:');
    const hash1 = await bcrypt.hash('password', 10);
    const hash2 = await bcrypt.hash('password', 10);
    console.log('Hash 1:', hash1);
    console.log('Hash 2:', hash2);
    console.log('Same password, different hashes:', hash1 !== hash2);
}

demonstratePasswordHashing();
