/**
 * analytics.service — abstraction for site analytics & admin overview metrics.
 * Backed by the site_analytics table (+ cross-table counts) today.
 */

export interface AnalyticsEvent {
  event_type: string;
  page_path: string;
  metadata?: Record<string, unknown>;
}

export interface DailyPageViews {
  date: string;
  views: number;
}

/** Aggregated KPIs for the admin dashboard overview. */
export interface AdminOverview {
  totalUsers: number;
  totalFormations: number;
  publishedFormations: number;
  recentViews: number;
  totalLeads: number;
  qualifiedLeads: number;
  totalDeals: number;
  totalRevenue: number;
}

export interface AnalyticsService {
  /** Fire-and-forget tracking of a site event. Never throws to the caller. */
  trackEvent(event: AnalyticsEvent): Promise<void>;
  /** Page views grouped by day over the last N days (default 7). */
  getPageViewsByDay(days?: number): Promise<DailyPageViews[]>;
  /** Full admin overview KPI bundle. */
  getAdminOverview(): Promise<AdminOverview>;
}

import { supabaseAnalyticsAdapter } from '@/lib/adapters/supabase/analytics.supabase';

export const analyticsService: AnalyticsService = supabaseAnalyticsAdapter;
