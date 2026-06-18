import AsyncStorage from '@react-native-async-storage/async-storage';
const TRANSACTION_PREFIX = 'casperid_authorization:';
const RESULT_PREFIX = 'casperid_authorization_result:';
const POPUP_PREFIX = 'casperid_authorization_popup:';
const TRANSACTION_TTL_MS = 30 * 60 * 1000;
function transactionKey(state) {
    return `${TRANSACTION_PREFIX}${state}`;
}
function resultKey(state) {
    return `${RESULT_PREFIX}${state}`;
}
function popupKey(state) {
    return `${POPUP_PREFIX}${state}`;
}
export async function saveTransaction(transaction) {
    await AsyncStorage.setItem(transactionKey(transaction.state), JSON.stringify({
        ...transaction,
        expiresAt: Date.now() + TRANSACTION_TTL_MS,
    }));
}
export async function loadTransaction(state) {
    const key = transactionKey(state);
    const stored = await AsyncStorage.getItem(key);
    if (!stored)
        return null;
    try {
        const transaction = JSON.parse(stored);
        if (transaction.expiresAt && transaction.expiresAt <= Date.now()) {
            await AsyncStorage.removeItem(key);
            return null;
        }
        return transaction;
    }
    catch {
        await AsyncStorage.removeItem(key);
        return null;
    }
}
export async function consumeTransaction(state) {
    const transaction = await loadTransaction(state);
    await AsyncStorage.removeItem(transactionKey(state));
    return transaction;
}
export async function storeResult(result) {
    await AsyncStorage.setItem(resultKey(result.state), JSON.stringify(result));
}
export async function loadResult(state) {
    const stored = await AsyncStorage.getItem(resultKey(state));
    if (!stored)
        return null;
    try {
        return JSON.parse(stored);
    }
    catch {
        return null;
    }
}
export async function clearResult(state) {
    await AsyncStorage.removeItem(resultKey(state));
}
export async function markPopupTransaction(state) {
    await AsyncStorage.setItem(popupKey(state), '1');
}
export async function isPopupTransaction(state) {
    return (await AsyncStorage.getItem(popupKey(state))) === '1';
}
export async function clearPopupTransaction(state) {
    await AsyncStorage.removeItem(popupKey(state));
}
//# sourceMappingURL=storage.js.map