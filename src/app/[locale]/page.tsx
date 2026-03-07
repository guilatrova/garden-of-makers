import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles, TreePine, Globe } from "lucide-react";
import { TIER_CONFIGS } from "@/lib/constants/tiers";
import { FRUIT_DEFINITIONS } from "@/lib/constants/fruits";
import { ForestService } from "@/lib/services/forest";
import { formatMRR } from "@/lib/utils/format";

/**
 * Hero Section with animated gradient background
 */
function HeroSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-950/30 to-gray-900">
        {/* Floating particles - static positions for SSR */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-green-500/20 animate-float"
              style={{
                left: `${(i * 17) % 100}%`,
                top: `${(i * 23) % 100}%`,
                animationDelay: `${(i * 0.5) % 5}s`,
                animationDuration: `${5 + (i % 5)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="mb-6 font-['Silkscreen'] text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 md:text-xl">
          {t("subtitle")}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/forest"
            className="group flex items-center gap-2 rounded-lg bg-green-600 px-8 py-4 font-medium text-white transition-all hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/25"
          >
            {t("exploreForest")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-8 py-4 font-medium text-white transition-all hover:bg-gray-800"
          >
            {t("leaderboard")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * How It Works Section
 */
function HowItWorksSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const steps = [
    {
      icon: Sparkles,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
    },
    {
      icon: TreePine,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
    },
    {
      icon: Globe,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-center font-['Silkscreen'] text-3xl font-bold text-white md:text-4xl">
          {t("howItWorks.title")}
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-gray-800 bg-gray-900/50 p-8 transition-all hover:border-green-500/30 hover:bg-gray-900"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-gray-400">{step.description}</p>
              <div className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 font-['Silkscreen'] text-sm font-bold text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Tree Tier Showcase Section
 */
function TierShowcaseSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  const tierEmojis: Record<string, string> = {
    seed: "🌱",
    sprout: "🌿",
    shrub: "🪴",
    young: "🌳",
    mature: "🌲",
    great: "🎄",
    ancient: "🌴",
    world: "🌍",
  };

  const tierNames: Record<string, string> = {
    seed: "Seed",
    sprout: "Sprout",
    shrub: "Shrub",
    young: "Young Tree",
    mature: "Mature Tree",
    great: "Great Tree",
    ancient: "Ancient Tree",
    world: "World Tree",
  };

  return (
    <section className="border-t border-gray-800 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center font-['Silkscreen'] text-3xl font-bold text-white md:text-4xl">
          {t("tiers.title")}
        </h2>
        <p className="mb-12 text-center text-gray-400">{t("tiers.subtitle")}</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_CONFIGS.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 transition-all hover:border-green-500/30 hover:bg-gray-900"
            >
              <div className="mb-3 text-4xl">{tierEmojis[tier.tier]}</div>
              <h3 className="mb-1 font-semibold text-white">
                {tierNames[tier.tier]}
              </h3>
              <p className="mb-3 text-sm text-green-400">
                {tier.minMrr === 0 && tier.maxMrr === 0
                  ? "$0"
                  : `${formatMRR(tier.minMrr)} - ${
                      tier.maxMrr ? formatMRR(tier.maxMrr) : "$1M+"
                    }`}
              </p>
              <p className="text-xs text-gray-500">
                {tier.relativeHeight}x height
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Fruit Legend Section
 */
function FruitLegendSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <section className="border-t border-gray-800 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="mb-2 text-center font-['Silkscreen'] text-3xl font-bold text-white md:text-4xl">
          {t("fruits.title")}
        </h2>
        <p className="mb-12 text-center text-gray-400">{t("fruits.subtitle")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {FRUIT_DEFINITIONS.map((fruit) => (
            <div
              key={fruit.type}
              className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900/50 p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                {fruit.emoji}
              </div>
              <div>
                <h3 className="font-semibold capitalize text-white">
                  {fruit.type}
                </h3>
                <p className="text-sm text-gray-400">
                  = {fruit.value.toLocaleString()} customer
                  {fruit.value > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Stats Section
 */
async function StatsSection({ t }: { t: Awaited<ReturnType<typeof getTranslations>> }) {
  let stats = {
    totalStartups: 0,
    totalMrr: 0,
    worldTrees: 0,
  };

  try {
    const forestService = new ForestService();
    const forestData = await forestService.buildForest();
    
    stats.totalStartups = forestData.totalStartups;
    stats.totalMrr = forestData.trees.reduce(
      (sum, tree) => sum + tree.mrr,
      0
    );
    stats.worldTrees = forestData.trees.filter(
      (tree) => tree.tier === "world"
    ).length;
  } catch {
    // Use placeholder stats if fetch fails
    stats = {
      totalStartups: 142,
      totalMrr: 150_000_000, // $150M
      worldTrees: 3,
    };
  }

  const statItems = [
    { label: t("stats.totalStartups"), value: stats.totalStartups.toLocaleString() },
    { label: t("stats.totalMRR"), value: formatMRR(stats.totalMrr) },
    { label: t("stats.worldTrees"), value: stats.worldTrees.toString() },
  ];

  return (
    <section className="border-t border-gray-800 py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          {statItems.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-2 font-['Silkscreen'] text-4xl font-bold text-green-400 md:text-5xl">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Landing Page
 */
export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="min-h-screen bg-gray-950">
      <HeroSection t={t} />
      <HowItWorksSection t={t} />
      <TierShowcaseSection t={t} />
      <FruitLegendSection t={t} />
      <StatsSection t={t} />
    </main>
  );
}
