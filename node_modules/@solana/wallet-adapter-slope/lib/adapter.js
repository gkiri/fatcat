"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlopeWalletAdapter = void 0;
const wallet_adapter_base_1 = require("@solana/wallet-adapter-base");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
class SlopeWalletAdapter extends wallet_adapter_base_1.BaseSignerWalletAdapter {
    constructor(config = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
        if (!this.ready)
            (0, wallet_adapter_base_1.pollUntilReady)(this, config.pollInterval || 1000, config.pollCount || 3);
    }
    get publicKey() {
        return this._publicKey;
    }
    get ready() {
        return typeof window !== 'undefined' && !!window.Slope;
    }
    get connecting() {
        return this._connecting;
    }
    get connected() {
        return !!this._publicKey;
    }
    get autoApprove() {
        return false;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.connected || this.connecting)
                    return;
                this._connecting = true;
                if (!window.Slope)
                    throw new wallet_adapter_base_1.WalletNotFoundError();
                const wallet = new window.Slope();
                let account;
                try {
                    const { data } = yield wallet.connect();
                    if (!data.publicKey)
                        throw new wallet_adapter_base_1.WalletConnectionError();
                    account = data.publicKey;
                }
                catch (error) {
                    if (error instanceof wallet_adapter_base_1.WalletError)
                        throw error;
                    throw new wallet_adapter_base_1.WalletConnectionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                let publicKey;
                try {
                    publicKey = new web3_js_1.PublicKey(account);
                }
                catch (error) {
                    throw new wallet_adapter_base_1.WalletPublicKeyError(error === null || error === void 0 ? void 0 : error.message, error);
                }
                this._wallet = wallet;
                this._publicKey = publicKey;
                this.emit('connect');
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
            finally {
                this._connecting = false;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = this._wallet;
            if (wallet) {
                this._wallet = null;
                this._publicKey = null;
                try {
                    const { msg } = yield wallet.disconnect();
                    if (msg !== 'ok')
                        throw new wallet_adapter_base_1.WalletDisconnectionError(msg);
                }
                catch (error) {
                    if (!(error instanceof wallet_adapter_base_1.WalletError)) {
                        // eslint-disable-next-line no-ex-assign
                        error = new wallet_adapter_base_1.WalletDisconnectionError(error === null || error === void 0 ? void 0 : error.message, error);
                    }
                    this.emit('error', error);
                }
                this.emit('disconnect');
            }
        });
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    const message = bs58_1.default.encode(transaction.serializeMessage());
                    const { msg, data } = yield wallet.signTransaction(message);
                    if (!data.publicKey || !data.signature)
                        throw new wallet_adapter_base_1.WalletSignTransactionError(msg);
                    const publicKey = new web3_js_1.PublicKey(data.publicKey);
                    const signature = bs58_1.default.decode(data.signature);
                    transaction.addSignature(publicKey, signature);
                    return transaction;
                }
                catch (error) {
                    if (error instanceof wallet_adapter_base_1.WalletError)
                        throw error;
                    throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
    signAllTransactions(transactions) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wallet = this._wallet;
                if (!wallet)
                    throw new wallet_adapter_base_1.WalletNotConnectedError();
                try {
                    const messages = transactions.map((transaction) => bs58_1.default.encode(transaction.serializeMessage()));
                    const { msg, data } = yield wallet.signAllTransactions(messages);
                    const length = transactions.length;
                    if (!data.publicKey || ((_a = data.signatures) === null || _a === void 0 ? void 0 : _a.length) !== length)
                        throw new wallet_adapter_base_1.WalletSignTransactionError(msg);
                    const publicKey = new web3_js_1.PublicKey(data.publicKey);
                    for (let i = 0; i < length; i++) {
                        transactions[i].addSignature(publicKey, bs58_1.default.decode(data.signatures[i]));
                    }
                    return transactions;
                }
                catch (error) {
                    if (error instanceof wallet_adapter_base_1.WalletError)
                        throw error;
                    throw new wallet_adapter_base_1.WalletSignTransactionError(error === null || error === void 0 ? void 0 : error.message, error);
                }
            }
            catch (error) {
                this.emit('error', error);
                throw error;
            }
        });
    }
}
exports.SlopeWalletAdapter = SlopeWalletAdapter;
//# sourceMappingURL=adapter.js.map