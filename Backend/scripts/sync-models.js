const sequelize = require('../config/db');
const { User, Task } = require('../models');

async function syncModels() {
    try {
        console.log('🔄 Syncing models with database...');
        
        // Sync all models (create tables)
        await sequelize.sync({ force: false }); // force: false means don't drop existing tables
        
        console.log('✅ All models synced successfully!');
        console.log('📋 Tables created:');
        console.log('   - users');
        console.log('   - tasks');
        
        // Test the connection
        await sequelize.authenticate();
        console.log('✅ Database connection verified!');
        
    } catch (error) {
        console.error('❌ Error syncing models:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

syncModels(); 