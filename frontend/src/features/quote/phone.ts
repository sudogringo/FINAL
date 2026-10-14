// 8 to 15 digits (E.164 allows up to 15), optional leading "+", spaces and dashes
// as separators. Counts digits, not characters, so "+54 9 11 0000-0000" is valid.
export const PHONE_RE = /^\+?(?:[\s-]*\d){8,15}[\s-]*$/
