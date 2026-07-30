import { sanityClient } from '@/infrastructure/sanity';
import type { DashboardResponse, MonthlyPropertyCount } from './dashboard.types';
import { PROPERTY_DOCUMENT } from '@/modules/property/constants';

export class DashboardService {
  async getDashboardStats(): Promise<DashboardResponse> {
    const query = `{
      "totalProperties": count(*[_type == "${PROPERTY_DOCUMENT.TYPE}" && !defined(deletedAt)]),
      "published": count(*[_type == "${PROPERTY_DOCUMENT.TYPE}" && !defined(deletedAt) && lifecycleStatus == "PUBLISHED"]),
      "draft": count(*[_type == "${PROPERTY_DOCUMENT.TYPE}" && !defined(deletedAt) && lifecycleStatus == "DRAFT"]),
      "featured": count(*[_type == "${PROPERTY_DOCUMENT.TYPE}" && !defined(deletedAt) && featured == true]),
      "recentProperties": *[_type == "${PROPERTY_DOCUMENT.TYPE}" && !defined(deletedAt)] | order(_createdAt desc) [0...5],
      "monthlyDates": *[_type == "${PROPERTY_DOCUMENT.TYPE}" && !defined(deletedAt)] { _createdAt }
    }`;

    const data = await sanityClient.fetch(query);

    // Aggregate monthly dates for the last 6 months
    const monthlyMap = new Map<string, number>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap.set(label, 0);
    }

    if (data.monthlyDates && Array.isArray(data.monthlyDates)) {
      data.monthlyDates.forEach((item: { _createdAt?: string }) => {
        if (!item._createdAt) return;
        const d = new Date(item._createdAt);
        const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyMap.has(label)) {
          monthlyMap.set(label, monthlyMap.get(label)! + 1);
        }
      });
    }

    const monthlyProperties: MonthlyPropertyCount[] = Array.from(monthlyMap.entries()).map(([month, count]) => ({
      month,
      count
    }));

    return {
      stats: {
        totalProperties: data.totalProperties || 0,
        published: data.published || 0,
        draft: data.draft || 0,
        featured: data.featured || 0,
      },
      charts: {
        propertyStatus: {
          published: data.published || 0,
          draft: data.draft || 0,
          featured: data.featured || 0,
        },
        monthlyProperties,
      },
      recentProperties: data.recentProperties || [],
      recentActivity: [],
      analytics: {},
    };
  }
}

export const dashboardService = new DashboardService();
