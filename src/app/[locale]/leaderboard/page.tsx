import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/utils/supabase/server";
import { TreeService } from "@/lib/services/tree";
import { TreeData } from "@/lib/services/tree/types";
import { mapRowToStartup, StartupRow } from "@/lib/utils/supabase/mappers";
import { getCategoryDisplayName, getCategoryColor } from "@/lib/constants/categories";
import { Link } from "@/i18n/routing";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboard | Garden of Makers",
  description: "Top startups ranked by monthly recurring revenue",
};

interface LeaderboardEntry extends TreeData {
  rank: number;
}

/**
 * Format MRR for display
 */
function formatMRR(mrrCents: number): string {
  const mrr = mrrCents / 100;
  if (mrr >= 1_000_000) {
    return `$${(mrr / 1_000_000).toFixed(1)}M/mo`;
  }
  if (mrr >= 1_000) {
    return `$${(mrr / 1_000).toFixed(1)}k/mo`;
  }
  return `$${Math.round(mrr)}/mo`;
}

/**
 * Get tier emoji and name
 */
function getTierInfo(tier: string): { emoji: string; name: string } {
  const tierMap: Record<string, { emoji: string; name: string }> = {
    seed: { emoji: "🌱", name: "Seed" },
    sprout: { emoji: "🌿", name: "Sprout" },
    shrub: { emoji: "🪴", name: "Shrub" },
    young: { emoji: "🌳", name: "Young" },
    mature: { emoji: "🌲", name: "Mature" },
    great: { emoji: "🎄", name: "Great" },
    ancient: { emoji: "🌴", name: "Ancient" },
    world: { emoji: "🌍", name: "World Tree" },
  };
  return tierMap[tier] ?? { emoji: "🌱", name: tier };
}

/**
 * Get rank medal color
 */
function getRankStyle(rank: number): string {
  if (rank === 1) {
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  }
  if (rank === 2) {
    return "bg-gray-400/20 text-gray-300 border-gray-400/50";
  }
  if (rank === 3) {
    return "bg-amber-600/20 text-amber-500 border-amber-600/50";
  }
  return "bg-gray-800 text-gray-400 border-gray-700";
}

/**
 * Growth badge component
 */
function GrowthBadge({ growth }: { growth: number | null }) {
  if (growth === null) {
    return (
      <span className="flex items-center gap-1 text-gray-500">
        <Minus className="h-3 w-3" />
        —
      </span>
    );
  }

  const percentage = Math.round(growth * 100);
  const isPositive = growth > 0;
  const isNeutral = growth === 0;

  return (
    <span
      className={`flex items-center gap-1 ${
        isPositive
          ? "text-green-400"
          : isNeutral
          ? "text-gray-400"
          : "text-red-400"
      }`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {percentage}%
    </span>
  );
}

/**
 * Fetch leaderboard data with caching
 */
async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const supabase = createServiceClient();
  const treeService = new TreeService();

  const { data, error } = await supabase
    .from("startups")
    .select("*")
    .order("revenue_last_30d_cents", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return [];
  }

  const rows = data as unknown as StartupRow[];

  return rows.map((row, index) => ({
    ...treeService.mapToTreeData(mapRowToStartup(row)),
    rank: index + 1,
  }));
}

/**
 * Leaderboard Page
 */
export default async function LeaderboardPage() {
  const t = await getTranslations("LeaderboardPage");

  let entries: LeaderboardEntry[] = [];
  let error: string | null = null;

  try {
    entries = await getLeaderboardData();
  } catch {
    error = "Failed to load leaderboard data";
  }

  return (
    <main className="min-h-screen bg-gray-950 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-['Silkscreen'] text-3xl font-bold text-white md:text-4xl">
            {t("title")}
          </h1>
          <p className="text-gray-400">{t("description")}</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && entries.length === 0 && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8 text-center">
            <p className="text-gray-400">{t("noResults")}</p>
          </div>
        )}

        {/* Leaderboard Table */}
        {!error && entries.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/80">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("rank")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("startup")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("mrr")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("customers")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("growth")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("tier")}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                      {t("category")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const tierInfo = getTierInfo(entry.tier);
                    const categoryName = getCategoryDisplayName(entry.category);
                    const categoryColor = getCategoryColor(entry.category);

                    return (
                      <tr
                        key={entry.slug}
                        className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/30"
                      >
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${getRankStyle(
                              entry.rank
                            )}`}
                          >
                            {entry.rank}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {entry.icon ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={entry.icon}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                                <TrendingUp className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">
                                {entry.name}
                              </div>
                              {entry.xHandle && (
                                <Link
                                  href={`/garden/${entry.xHandle.replace("@", "")}`}
                                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                                >
                                  View @{entry.xHandle.replace("@", "")}&apos;s Garden →
                                </Link>
                              )}
                              {entry.onSale && !entry.xHandle && (
                                <div className="flex items-center gap-1 text-xs text-yellow-400">
                                  <Store className="h-3 w-3" />
                                  {t("forSale")}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-lg font-semibold text-green-400">
                            {formatMRR(entry.mrrCents)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          {entry.customers.toLocaleString()}
                        </td>
                        <td className="px-4 py-4">
                          <GrowthBadge growth={entry.growth30d} />
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">
                            <span>{tierInfo.emoji}</span>
                            <span>{tierInfo.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="inline-block rounded-full px-2 py-1 text-xs"
                            style={{
                              backgroundColor: `${categoryColor}22`,
                              color: categoryColor,
                            }}
                          >
                            {categoryName}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {entries.map((entry) => {
                const tierInfo = getTierInfo(entry.tier);
                const categoryName = getCategoryDisplayName(entry.category);
                const categoryColor = getCategoryColor(entry.category);

                return (
                  <div
                    key={entry.slug}
                    className="flex items-center gap-4 border-b border-gray-800/50 p-4 transition-colors hover:bg-gray-800/30"
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-sm font-bold ${getRankStyle(
                        entry.rank
                      )}`}
                    >
                      {entry.rank}
                    </span>

                    <div className="flex flex-1 items-center gap-3">
                      {entry.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.icon}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                          <TrendingUp className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-white">
                            {entry.name}
                          </span>
                          {entry.onSale && (
                            <Store className="h-3 w-3 flex-shrink-0 text-yellow-400" />
                          )}
                        </div>
                        {entry.xHandle && (
                          <Link
                            href={`/garden/${entry.xHandle.replace("@", "")}`}
                            className="text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            View @{entry.xHandle.replace("@", "")}&apos;s Garden →
                          </Link>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-green-400">
                            {formatMRR(entry.mrrCents)}
                          </span>
                          <span className="text-gray-500">·</span>
                          <GrowthBadge growth={entry.growth30d} />
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {tierInfo.emoji} {tierInfo.name}
                          </span>
                          <span
                            className="rounded px-1.5 py-0.5 text-xs"
                            style={{
                              backgroundColor: `${categoryColor}22`,
                              color: categoryColor,
                            }}
                          >
                            {categoryName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
