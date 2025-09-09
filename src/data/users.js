// User data for authentication
const users = [
    {
        id: 1,
        email: 'admin@test.com',
        password: 'admin123', // In production, this should be hashed
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: 2,
        email: 'user@test.com',
        password: 'user123',
        name: 'Regular User',
        role: 'user'
    },
    {
        id: 3,
        email: 'demo@test.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'user'
    }
];

// Function to find user by email
export function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

// Function to validate user credentials
export function validateUser(email, password) {
    const user = findUserByEmail(email);
    if (user && user.password === password) {
        // Return user without password for security
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}

// Function to get all users (for admin purposes)
export function getAllUsers() {
    return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
}

export default users;
