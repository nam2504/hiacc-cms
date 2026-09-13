/**
 * Interface log lỗi/cảnh báo dùng chung toàn app. Implementation mặc định ghi
 * ra console — đổi sang Sentry/Datadog sau này chỉ cần viết Logger mới ở đây,
 * không sửa từng nơi gọi.
 */
export interface LogContext {
  [key: string]: unknown
}

export interface Logger {
  error(label: string, err: unknown, context?: LogContext): void
  warn(label: string, context?: LogContext): void
  info(label: string, context?: LogContext): void
}

class ConsoleLogger implements Logger {
  error(label: string, err: unknown, context?: LogContext): void {
    console.error(label, err, context ?? '')
  }
  warn(label: string, context?: LogContext): void {
    console.warn(label, context ?? '')
  }
  info(label: string, context?: LogContext): void {
    console.info(label, context ?? '')
  }
}

export const logger: Logger = new ConsoleLogger()
