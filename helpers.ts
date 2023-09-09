export function cumpleConTipo(obj: any, tipo: any): boolean {
  for (const key in tipo) {
    if (!(key in obj) || typeof obj[key] !== typeof tipo[key]) {
      return false;
    }
  }
  return true;
}
