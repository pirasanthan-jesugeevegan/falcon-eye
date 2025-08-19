// SonarCloud metrics constants
export const ALLOWED_METRICS = ['pull_request', 'project_status'] as const;
export type MetricType = (typeof ALLOWED_METRICS)[number];
