jest.mock('../database/models', () => ({
    AdminUser: {}
}));

const { hashPassword, verifyPassword } = require('./admin-auth');

describe('admin password hashing', () => {
    test('verifies the original password', () => {
        const password = 'correct-horse-battery-staple';
        const { salt, hash } = hashPassword(password);

        expect(verifyPassword(password, salt, hash)).toBe(true);
    });

    test('rejects a different password', () => {
        const { salt, hash } = hashPassword('correct-password');

        expect(verifyPassword('wrong-password', salt, hash)).toBe(false);
    });
});
