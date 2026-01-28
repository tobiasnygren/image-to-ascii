/**
 * ASCII-teckenuppsättningar för bildkonvertering
 *
 * Tecknen är ordnade från mörkt till ljust.
 * Mörkare tecken används för låga pixelvärden (mörka områden),
 * ljusare tecken för höga pixelvärden (ljusa områden).
 */

// Standard teckenuppsättning - 10 nivåer
export const standard = '@%#*+=-:. ';

// Enkel teckenuppsättning - 4 nivåer
export const simple = '@#:. ';

// Detaljerad teckenuppsättning - fler nyanser
export const detailed = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

// Block-tecken (för terminal som stödjer unicode)
export const blocks = '\u2588\u2593\u2592\u2591 ';

// Default export
export default standard;
