const mongoose = require('mongoose');
require('dotenv').config();

const userAccountSchema = new mongoose.Schema({
    wallet: String,
    cns_name: String,
    onchain_name_tx: String
});
const UserAccount = mongoose.models.UserAccount || mongoose.model('UserAccount', userAccountSchema);

async function findOne() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await UserAccount.findOne({ cns_name: { $exists: true, $ne: null } });
        if (user) {
            console.log("Found user with name:", user.cns_name);
            console.log("Wallet:", user.wallet);
            console.log("Tx Hash:", user.onchain_name_tx);
        } else {
            console.log("No users found with a registered name.");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

findOne();
