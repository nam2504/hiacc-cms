/**
 * Hằng số bố cục dùng chung cho JS. Giá trị phải khớp với tokens.css —
 * media query trong CSS không đọc được biến TS nên hai nơi phải sửa cùng nhau.
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1200,
} as const

export const CONTAINER_MAX = 1200
export const HEADER_HEIGHT = 76
