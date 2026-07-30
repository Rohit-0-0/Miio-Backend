import type { PropertyDocument } from '@/modules/property/property.types';

export interface DashboardStats {
  totalProperties: number;
  published: number;
  draft: number;
  featured: number;
}

export interface PropertyStatusChart {
  published: number;
  draft: number;
  featured: number;
}

export interface MonthlyPropertyCount {
  month: string;
  count: number;
}

export interface DashboardCharts {
  propertyStatus: PropertyStatusChart;
  monthlyProperties: MonthlyPropertyCount[];
}

export interface RecentActivityItem {
  type: string;
  propertyId: string;
  propertyName: string;
  user: string;
  createdAt: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  charts: DashboardCharts;
  recentProperties: PropertyDocument[];
  recentActivity: RecentActivityItem[];
  analytics: Record<string, any>;
}
