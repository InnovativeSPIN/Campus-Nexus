import initModels from '../models/index.js';
import colors from 'colors';

// Initialize models
const models = initModels();
const { User } = models;

const seedSuperAdmin = async () => {
    try {
        const superAdminEmail = 'vasanthi@gmail.com';
        const exists = await User.findOne({ where: { email: superAdminEmail } });

        if (!exists) {
            console.log('Creating initial Super Admin...'.yellow);
            await User.create({
                name: 'vasanth',
                email: superAdminEmail,
                password: 'password',
                role_id: 2, // super-admin
                phone: '9876543210',
                isActive: true
            });
            console.log('Super Admin "vasanth" created successfully.'.green.bold);
        } else {
            console.log('Super Admin already exists.'.blue);
        }
    } catch (error) {
        console.error(`Error seeding Super Admin: ${error.message}`.red);
    }
};

export default seedSuperAdmin;
