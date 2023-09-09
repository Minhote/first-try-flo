"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cumpleConTipo = void 0;
function cumpleConTipo(obj, tipo) {
    for (const key in tipo) {
        if (!(key in obj) || typeof obj[key] !== typeof tipo[key]) {
            return false;
        }
    }
    return true;
}
exports.cumpleConTipo = cumpleConTipo;
