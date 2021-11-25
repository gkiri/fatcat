"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletListItem = void 0;
const react_1 = __importDefault(require("react"));
const Button_1 = require("./Button");
const WalletIcon_1 = require("./WalletIcon");
const WalletListItem = ({ handleClick, tabIndex, wallet }) => {
    return (react_1.default.createElement("li", null,
        react_1.default.createElement(Button_1.Button, { onClick: handleClick, endIcon: react_1.default.createElement(WalletIcon_1.WalletIcon, { wallet: wallet }), tabIndex: tabIndex }, wallet.name)));
};
exports.WalletListItem = WalletListItem;
//# sourceMappingURL=WalletListItem.js.map