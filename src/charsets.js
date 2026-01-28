/**
 * ASCII character sets for image conversion
 *
 * Characters are ordered from dark to light.
 * Darker characters are used for low pixel values (dark areas),
 * lighter characters for high pixel values (light areas).
 */

// Standard character set - 10 levels
export const standard = '@%#*+=-:. ';

// Simple character set - 4 levels
export const simple = '@#:. ';

// Detailed character set - more shades
export const detailed = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ';

// Block characters (for terminals that support unicode)
export const blocks = '\u2588\u2593\u2592\u2591 ';

// Default export
export default standard;
