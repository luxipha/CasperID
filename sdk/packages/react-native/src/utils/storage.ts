import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredTransaction, StoredResult } from './types';

const TRANSACTION_PREFIX = 'casperid_authorization:';
const RESULT_PREFIX = 'casperid_authorization_result:';
const POPUP_PREFIX = 'casperid_authorization_popup:';

function transactionKey(state: string): string {
    return `${TRANSACTION_PREFIX}${state}`;
}

function resultKey(state: string): string {
    return `${RESULT_PREFIX}${state}`;
}

function popupKey(state: string): string {
    return `${POPUP_PREFIX}${state}`;
}

export async function saveTransaction(transaction: StoredTransaction): Promise<void> {
    await AsyncStorage.setItem(transactionKey(transaction.state), JSON.stringify(transaction));
}

export async function loadTransaction(state: string): Promise<StoredTransaction | null> {
    const stored = await AsyncStorage.getItem(transactionKey(state));
    if (!stored) return null;
    try {
        return JSON.parse(stored) as StoredTransaction;
    } catch {
        return null;
    }
}

export async function consumeTransaction(state: string): Promise<StoredTransaction | null> {
    const transaction = await loadTransaction(state);
    await AsyncStorage.removeItem(transactionKey(state));
    return transaction;
}

export async function storeResult(result: StoredResult): Promise<void> {
    await AsyncStorage.setItem(resultKey(result.state), JSON.stringify(result));
}

export async function loadResult(state: string): Promise<StoredResult | null> {
    const stored = await AsyncStorage.getItem(resultKey(state));
    if (!stored) return null;
    try {
        return JSON.parse(stored) as StoredResult;
    } catch {
        return null;
    }
}

export async function clearResult(state: string): Promise<void> {
    await AsyncStorage.removeItem(resultKey(state));
}

export async function markPopupTransaction(state: string): Promise<void> {
    await AsyncStorage.setItem(popupKey(state), '1');
}

export async function isPopupTransaction(state: string): Promise<boolean> {
    return (await AsyncStorage.getItem(popupKey(state))) === '1';
}

export async function clearPopupTransaction(state: string): Promise<void> {
    await AsyncStorage.removeItem(popupKey(state));
}
