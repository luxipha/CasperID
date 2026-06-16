import type { StoredTransaction, StoredResult } from './types';
export declare function saveTransaction(transaction: StoredTransaction): Promise<void>;
export declare function loadTransaction(state: string): Promise<StoredTransaction | null>;
export declare function consumeTransaction(state: string): Promise<StoredTransaction | null>;
export declare function storeResult(result: StoredResult): Promise<void>;
export declare function loadResult(state: string): Promise<StoredResult | null>;
export declare function clearResult(state: string): Promise<void>;
export declare function markPopupTransaction(state: string): Promise<void>;
export declare function isPopupTransaction(state: string): Promise<boolean>;
export declare function clearPopupTransaction(state: string): Promise<void>;
//# sourceMappingURL=storage.d.ts.map