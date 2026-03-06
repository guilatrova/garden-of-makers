import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TrustMRRProvider } from "@/lib/providers/trustmrr";
import { TreeService } from "@/lib/services/tree";
import { getTierConfig } from "@/lib/services/tree/TreeCalculator";
import { getCategoryDisplayName, getCategoryColor } from "@/lib/constants/categories";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ExternalLink, Twitter, TrendingUp, Users, DollarSign, Percent, CreditCard, Shield, Code2, Users2 } from "lucide-react";

interface GardenPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

/**
 * Generate metadata for the garden page
 */
export async function generateMetadata({ params }: GardenPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const provider = new TrustMRRProvider();
    const { response } = await provider.getStartup(slug);
    const startup = response.data;

    const mrrFormatted = `$${(startup.revenue.mrr / 100 / 1000).toFixed(1)}k/mo`;

    return {
      title: `${startup.name} | Garden of Makers`,
      description: `${startup.name} is making ${mrrFormatted} with ${startup.customers} customers. Explore their garden in the forest of startups.`,
      openGraph: {
        title: `${startup.name} - ${mrrFormatted} MRR`,
        description: `Explore ${startup.name}'s garden with ${startup.customers} customers`,
        images: [`/api/share/${slug}`],
      },
      twitter: {
        card: "summary_large_image",
        title: `${startup.name} - ${mrrFormatted} MRR`,
        description: `Explore ${startup.name}'s garden with ${startup.customers} customers`,
        images: [`/api/share/${slug}`],
      },
    };
  } catch {
    return {
      title: "Startup Not Found | Garden of Makers",
    };
  }
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
 * Format revenue for display
 */
function formatRevenue(revenueCents: number): string {
  const revenue = revenueCents / 100;
  if (revenue >= 1_000_000) {
    return `$${(revenue / 1_000_000).toFixed(1)}M`;
  }
  if (revenue >= 1_000) {
    return `$${(revenue / 1_000).toFixed(1)}k`;
  }
  return `$${Math.round(revenue)}`;
}

/**
 * Format growth as percentage
 */
function formatGrowth(growth: number | null): { text: string; positive: boolean | null } {
  if (growth === null) return { text: "—", positive: null };
  const percentage = Math.round(growth * 100);
  return {
    text: growth > 0 ? `+${percentage}%` : `${percentage}%`,
    positive: growth > 0,
  };
}

/**
 * Get tier emoji and name
 */
function getTierInfo(tier: string): { emoji: string; name: string; description: string } {
  const tierMap: Record<string, { emoji: string; name: string; description: string }> = {
    seed: { emoji: "🌱", name: "Seed", description: "Just getting started" },
    sprout: { emoji: "🌿", name: "Sprout", description: "Early growth" },
    shrub: { emoji: "🪴", name: "Shrub", description: "Building roots" },
    young: { emoji: "🌳", name: "Young Tree", description: "Growing strong" },
    mature: { emoji: "🌲", name: "Mature Tree", description: "Established" },
    great: { emoji: "🎄", name: "Great Tree", description: "Impressive" },
    ancient: { emoji: "🌴", name: "Ancient Tree", description: "Legendary" },
    world: { emoji: "🌍", name: "World Tree", description: "Unstoppable" },
  };
  return tierMap[tier] ?? { emoji: "🌱", name: tier, description: "" };
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
 * Fruit breakdown component
 */
function FruitBreakdown({ fruits }: { fruits: { watermelons: number; oranges: number; apples: number; blueberries: number } }) {
  const items = [
    { emoji: "🍉", count: fruits.watermelons, label: "1,000 customers" },
    { emoji: "🍊", count: fruits.oranges, label: "100 customers" },
    { emoji: "🍎", count: fruits.apples, label: "10 customers" },
    { emoji: "🫐", count: fruits.blueberries, label: "1 customer" },
  ].filter((item) => item.count > 0);

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-sm"
        >
          <span>{item.emoji}</span>
          <span className="text-gray-300">
            {item.count} × {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Garden Page
 */
export default async function GardenPage({ params }: GardenPageProps) {
  const { slug } = await params;
  const t = await getTranslations("GardenPage");

  let startup;
  let treeData;

  try {
    const provider = new TrustMRRProvider();
    const treeService = new TreeService();
    const { response } = await provider.getStartup(slug);
    startup = response.data;
    treeData = treeService.mapToTreeData(startup);
  } catch {
    notFound();
  }

  const tierInfo = getTierInfo(treeData.tier);
  const categoryName = getCategoryDisplayName(treeData.category);
  const categoryColor = getCategoryColor(treeData.category);
  const growth = formatGrowth(treeData.growth30d);

  const shareUrl = `https://gardenofmakers.com/garden/${slug}`;
  const shareText = encodeURIComponent(
    `${startup.name} is making ${formatMRR(treeData.mrrCents)} with ${treeData.customers} customers 🌳 Check out their garden:`
  );

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/forest"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToForest")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Startup Header Card */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-start gap-4">
                {startup.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={startup.icon}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-800">
                    <TrendingUp className="h-10 w-10 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white md:text-3xl">
                        {startup.name}
                      </h1>
                      {startup.description && (
                        <p className="mt-1 text-gray-400">{startup.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        {t("shareOnX")}
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                      style={{
                        backgroundColor: `${categoryColor}22`,
                        color: categoryColor,
                      }}
                    >
                      {categoryName}
                    </span>
                    {startup.website && (
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </a>
                    )}
                    {startup.xHandle && (
                      <a
                        href={`https://x.com/${startup.xHandle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <Twitter className="h-3 w-3" />
                        @{startup.xHandle.replace("@", "")}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">MRR</span>
                </div>
                <div className="font-['Silkscreen'] text-2xl font-bold text-green-400">
                  {formatMRR(treeData.mrrCents)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">{t("growth")}</span>
                </div>
                <div
                  className={`font-['Silkscreen'] text-2xl font-bold ${
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
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Percent className="h-4 w-4" />
                  <span className="text-sm">{t("profitMargin")}</span>
                </div>
                <div className="font-['Silkscreen'] text-2xl font-bold text-white">
                  {startup.profitMarginLast30Days
                    ? `${Math.round(startup.profitMarginLast30Days * 100)}%`
                    : "—"}
                </div>
              </div>
            </div>

            {/* Customers Section */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Customers</h2>
                <span className="ml-2 font-['Silkscreen'] text-xl text-green-400">
                  {treeData.customers.toLocaleString()}
                </span>
              </div>
              <FruitBreakdown fruits={treeData.fruits} />
              {startup.activeSubscriptions > 0 && (
                <div className="mt-4 text-sm text-gray-400">
                  {t("activeSubscriptions")}: {startup.activeSubscriptions.toLocaleString()}
                </div>
              )}
            </div>

            {/* Tech Stack */}
            {startup.techStack && startup.techStack.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-white">{t("techStack")}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {startup.techStack.map((tech) => (
                    <span
                      key={tech.slug}
                      className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-300"
                    >
                      {tech.slug}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cofounders */}
            {startup.cofounders && startup.cofounders.length > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Users2 className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-white">{t("cofounders")}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {startup.cofounders.map((cofounder) => (
                    <a
                      key={cofounder.xHandle}
                      href={`https://x.com/${cofounder.xHandle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <Twitter className="h-3 w-3" />
                      {cofounder.xName || cofounder.xHandle}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Tree Tier Card */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
              <div className="mb-2 text-6xl">{tierInfo.emoji}</div>
              <h3 className="text-lg font-semibold text-white">{tierInfo.name}</h3>
              <p className="text-sm text-gray-400">{tierInfo.description}</p>
              <div className="mt-4 rounded-lg bg-gray-800 p-3">
                <div className="text-xs text-gray-500">MRR Range</div>
                <div className="text-sm text-green-400">
                  {formatMRR(getTierConfig(treeData.tier).minMrrCents)} -{" "}
                  {getTierConfig(treeData.tier).maxMrrCents
                    ? formatMRR(getTierConfig(treeData.tier).maxMrrCents!)
                    : "$1M+"}
                </div>
              </div>
            </div>

            {/* Payment Provider */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <div className="mb-3 flex items-center gap-2 text-gray-400">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">{t("paymentProvider")}</span>
              </div>
              <div className="font-medium text-white">
                {getProviderDisplayName(startup.paymentProvider)}
              </div>
              {startup.isMerchantOfRecord && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                  <Shield className="h-3 w-3" />
                  {t("merchantOfRecord")}
                </div>
              )}
            </div>

            {/* Revenue Summary */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="mb-4 text-sm font-medium text-gray-400">Revenue</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t("totalRevenue")}</span>
                  <span className="font-mono text-white">
                    {formatRevenue(startup.revenue.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last 30 Days</span>
                  <span className="font-mono text-white">
                    {formatRevenue(startup.revenue.last30Days)}
                  </span>
                </div>
              </div>
            </div>

            {/* For Sale */}
            {startup.onSale && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                <div className="mb-2 text-sm font-medium text-yellow-400">
                  {t("forSale")}
                </div>
                {startup.askingPrice && (
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-yellow-300">
                      {formatRevenue(startup.askingPrice)}
                    </span>
                  </div>
                )}
                {startup.multiple && (
                  <div className="text-sm text-yellow-400/70">
                    {startup.multiple}x multiple
                  </div>
                )}
              </div>
            )}

            {/* X Followers */}
            {startup.xFollowerCount && startup.xFollowerCount > 0 && (
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Twitter className="h-4 w-4" />
                  <span className="text-sm">X Followers</span>
                </div>
                <div className="mt-1 font-mono text-white">
                  {startup.xFollowerCount.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
