const cron = require('node-cron');
const { User } = require('../config/db');

const initCreditGuard = () => {
  // Run at midnight UTC (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running Daily Credit Reset...');
    try {
      const result = await User.updateMany({}, {
        $set: {
          dailyImages: 0,
          dailyShorts: 0,
          dailyLongVids: 0,
          lastResetDate: new Date()
        }
      });
      console.log(`✅ Credits reset for ${result.modifiedCount} users.`);
    } catch (error) {
      console.error('❌ Error resetting credits:', error);
    }
  }, {
    timezone: "UTC"
  });
  console.log('🛡️ CreditGuard Initialized: Reset scheduled for Midnight UTC.');
};

module.exports = initCreditGuard;
