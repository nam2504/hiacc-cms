/**
 * Interface đo lường dùng chung toàn app. Chưa gắn vào call site nào — tạo
 * sẵn để cắm Prometheus/Fly metrics khi thật sự cần đo, tránh đoán trước sai
 * chỗ cần đo.
 */
export interface MetricsPort {
  recordPageView(route: string): void
  recordError(label: string): void
  recordDbQuery(collection: string, durationMs: number): void
}

class NoopMetrics implements MetricsPort {
  recordPageView(): void {}
  recordError(): void {}
  recordDbQuery(): void {}
}

export const metrics: MetricsPort = new NoopMetrics()
