try {
    require('blakejs');
    console.log('✅ blakejs found');
} catch (e) {
    console.log('❌ blakejs NOT found');
}

try {
    const sdk = require('casper-js-sdk');
    console.log('SDK keys:', Object.keys(sdk));
} catch (e) { }
