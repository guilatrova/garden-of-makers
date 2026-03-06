"use client";

/**
 * StartupDrawer Component
 * Side panel that appears when clicking a tree
 */

import { TreeData } from "@/lib/services/tree/types";
import { getCategoryDisplayName, getCategoryColor } from "@/lib/constants/categories";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { X, ExternalLink, Twitter } from "lucide-react";

interface StartupDrawerProps {
  startup: TreeData | null;
  onClose: () => void;
}

/**
 * Format MRR for display (cents to $X.Xk/mo format)
 */
function formatMRR(mrrCents: number): string {
  const mrr = mrrCents / 100;
  if (mrr >= 1000) {
    return `$${(mrr / 1000).toFixed(1)}k/mo`;
  }
  return `$${mrr.toFixed(0)}/mo`;
}

/**
 * Format revenue for display
 */
function formatRevenue(revenueCents: number): string {
  const revenue = revenueCents / 100;
  if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(1)}k`;
  }
  return `$${revenue.toFixed(0)}`;
}

/**
 * Format asking price for display
 */
function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return "—";
  const price = priceCents / 100;
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}k`;
  }
  return `$${price.toFixed(0)}`;
}

/**
 * Get growth display with color
 */
function getGrowthDisplay(growth: number | null): { text: string; positive: boolean | null } {
  if (growth === null) return { text: "—", positive: null };
  const percentage = Math.round(growth * 100);
  return {
    text: growth > 0 ? `+${percentage}%` : `${percentage}%`,
    positive: growth > 0,
  };
}

/**
 * Get payment provider display name
 */
function getProviderDisplayName(provider: string): string {
  const names: Record<string, string> = {
    stripe: "Stripe",
    lemonsqueezy: "Lemon Squeezy",
    paddle: "Paddle",
    polar: "Polar",
    revenuecat: "RevenueCat",
    dodopayment: "Dodo Payment",
  };
  return names[provider.toLowerCase()] ?? provider;
}

/**
 * Fruit breakdown visual component
 */
function FruitBreakdown({ fruits }: { fruits: TreeData["fruits"] }) {
  const t = useTranslations("drawer");

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400">{t("customers")}</div>
      <div className="flex flex-wrap gap-2">
        {fruits.watermelons > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-sm">
            <span>🍉</span>
            <span className="text-red-300">{fruits.watermelons}</span>
          </div>
        )}
        {fruits.oranges > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1 text-sm">
            <span>🍊</span>
            <span className="text-orange-300">{fruits.oranges}</span>
          </div>
        )}
        {fruits.apples > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-red-400/20 px-2 py-1 text-sm">
            <span>🍎</span>
            <span className="text-red-300">{fruits.apples}</span>
          </div>
        )}
        {fruits.blueberries > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-sm">
            <span>🫐</span>
            <span className="text-blue-300">{fruits.blueberries}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StartupDrawer({ startup, onClose }: StartupDrawerProps) {
  const t = useTranslations("drawer");

  if (!startup) return null;

  const categoryName = getCategoryDisplayName(startup.category);
  const categoryColor = getCategoryColor(startup.category);
  const growth = getGrowthDisplay(startup.growth30d);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-gray-900 shadow-2xl transition-transform duration-300 ease-out">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <div className="flex items-center gap-3">
              {startup.icon && (
                <Image
                  src={startup.icon}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              )}
              <h2 className="text-xl font-bold text-white">{startup.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* MRR */}
            <div>
              <div className="text-sm text-gray-400">{t("mrr")}</div>
              <div className="text-3xl font-bold text-green-400">
                {formatMRR(startup.mrrCents)}
              </div>
            </div>

            {/* Customers with fruit breakdown */}
            <FruitBreakdown fruits={startup.fruits} />

            {/* Growth */}
            <div>
              <div className="text-sm text-gray-400">{t("growth")}</div>
              <div
                className={`text-lg font-semibold ${
                  growth.positive === true
                    ? "text-green-400"
                    : growth.positive === false
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {growth.text}
              </div>
            </div>

            {/* Revenue (30d) */}
            <div>
              <div className="text-sm text-gray-400">{t("revenue")}</div>
              <div className="text-lg font-semibold text-white">
                {formatRevenue(startup.revenueLast30DaysCents)}
              </div>
            </div>

            {/* Payment Provider */}
            <div>
              <div className="text-sm text-gray-400">{t("provider")}</div>
              <div className="text-lg font-semibold text-white">
                {getProviderDisplayName(startup.paymentProvider)}
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="text-sm text-gray-400">{t("category")}</div>
              <span
                className="inline-block rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${categoryColor}33`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}`,
                }}
              >
                {categoryName}
              </span>
            </div>

            {/* For Sale */}
            {startup.onSale && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="text-sm text-yellow-400">{t("forSale")}</div>
                {startup.askingPriceCents && (
                  <div className="mt-1 text-xl font-bold text-yellow-300">
                    {t("askingPrice")}: {formatPrice(startup.askingPriceCents)}
                  </div>
                )}
              </div>
            )}

            {/* Links */}
            <div className="space-y-3 pt-4">
              {startup.slug && (
                <a
                  href={`https://trustmrr.com/startups/${startup.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("visitWebsite")}
                </a>
              )}

              {startup.xHandle && (
                <a
                  href={`https://x.com/${startup.xHandle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 text-white hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  {t("viewOnX")}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StartupDrawer;
