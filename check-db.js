const mongoose = require('mongoose');
const { Credential, VerificationRequest } = require('./server/src/database/models');

mongoose.connect('mongodb://127.0.0.1:27017/casperId', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Database contents:');
    
    const credentials = await Credential.find({}).lean();
    console.log('\nCredentials (verified users):');
    if (credentials.length === 0) {
      console.log('No verified credentials found');
    }
    credentials.forEach(cred => {
      console.log('Wallet: ' + cred.wallet + ', Tier: ' + cred.tier + ', Verified: ' + (!cred.revoked));
    });
    
    const requests = await VerificationRequest.find({}).lean();
    console.log('\nVerification Requests:');
    if (requests.length === 0) {
      console.log('No verification requests found');
    }
    requests.forEach(req => {
      console.log('Wallet: ' + req.wallet + ', Status: ' + req.status + ', CNS: ' + (req.cns_name || 'none'));
    });
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('DB connection error:', err.message);
    mongoose.disconnect();
  });