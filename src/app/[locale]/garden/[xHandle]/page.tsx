import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MakerGardenService } from "@/lib/services/garden";
import { TreeData } from "@/lib/services/tree/types";
import {
  getCategoryDisplayName,
  getCategoryColor,
} from "@/lib/constants/categories";
import { formatMRR } from "@/lib/utils/format";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Twitter, TrendingUp, Users, Store } from "lucide-react";
import { GardenScene } from "./GardenScene";

interface GardenPageProps {
  params: Promise<{ xHandle: string; locale: string }>;
}

/**
 * Generate metadata for the garden page
 */
export async function generateMetadata({
  params,
}: GardenPageProps): Promise<Metadata> {
  const { xHandle } = await params;

  try {
    const makerGardenService = new MakerGardenService();
    const garden = await makerGardenService.buildGarden(xHandle);

    if (!garden) {
      return {
        title: "Maker Not Found | Garden of Makers",
      };
    }

    const displayName = garden.xName ?? `@${garden.xHandle}`;
    const mrrFormatted = `${formatMRR(garden.totalMRR)} total`;

    return {
      title: `${displayName}'s Garden | Garden of Makers`,
      description: `${displayName} has ${garden.totalProducts} product${garden.totalProducts === 1 ? "" : "s"} with ${mrrFormatted} and ${garden.totalCustomers.toLocaleString()} customers. Explore their personal garden.`,
      openGraph: {
        title: `${displayName}'s Garden — ${mrrFormatted}`,
        description: `${garden.totalProducts} products • ${garden.totalCustomers.toLocaleString()} customers`,
        images: [`/api/share/maker/${garden.xHandle}`],
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayName}'s Garden — ${mrrFormatted}`,
        description: `${garden.totalProducts} products • ${garden.totalCustomers.toLocaleString()} customers`,
        images: [`/api/share/maker/${garden.xHandle}`],
      },
    };
  } catch {
    return {
      title: "Garden | Garden of Makers",
    };
  }
}

/**
 * Get garden size display info
 */
function getGardenSizeInfo(size: string): { emoji: string; label: string } {
  const sizeMap: Record<string, { emoji: string; label: string }> = {
    small: { emoji: "🌱", label: "Small Garden" },
    medium: { emoji: "🌿", label: "Garden" },
    large: { emoji: "🌳", label: "Large Garden" },
    estate: { emoji: "🌲", label: "Estate" },
  };
  return sizeMap[size] ?? { emoji: "🌱", label: size };
}

/**
 * Get tier emoji
 */
function getTierEmoji(tier: string): string {
  const tierMap: Record<string, string> = {
    seed: "🌱",
    sprout: "🌿",
    shrub: "🪴",
    young: "🌳",
    mature: "🌲",
    great: "🎄",
    ancient: "🌴",
    world: "🌍",
  };
  return tierMap[tier] ?? "🌱";
}

/**
 * Garden Page
 */
export default async function GardenPage({ params }: GardenPageProps) {
  const { xHandle } = await params;
  const t = await getTranslations("GardenPage");

  let garden;

  try {
    const makerGardenService = new MakerGardenService();
    garden = await makerGardenService.buildGarden(xHandle);
  } catch {
    notFound();
  }

  if (!garden) {
    notFound();
  }

  const displayName = garden.xName ?? `@${garden.xHandle}`;
  const gardenSizeInfo = getGardenSizeInfo(garden.gardenSize);
  const shareUrl = `https://gardenofmakers.com/garden/${garden.xHandle}`;
  const shareText = encodeURIComponent(
    `${displayName} has ${garden.totalProducts} product${garden.totalProducts === 1 ? "" : "s"} with ${formatMRR(garden.totalMRR)} and ${garden.totalCustomers.toLocaleString()} customers 🌳 Check out their garden:`,
  );

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToForest")}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Maker Profile Header */}
        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/50 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Avatar and Name */}
            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-3xl font-bold text-gray-950">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  {t("makerGarden", { name: displayName })}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  {garden.xFollowerCount && garden.xFollowerCount > 0 && (
                    <span className="text-sm text-gray-400">
                      {t("followers", {
                        count: garden.xFollowerCount.toLocaleString(),
                      })}
                    </span>
                  )}
                  <a
                    href={`https://x.com/${garden.xHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Twitter className="h-3 w-3" />@{garden.xHandle}
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Share button */}
            <div className="flex items-center gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <Twitter className="h-4 w-4" />
                {t("shareOnX")}
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-800 pt-6 md:grid-cols-4">
            <div>
              <div className="text-sm text-gray-500">{t("totalMRR")}</div>
              <div className="font-['Silkscreen'] text-xl font-bold text-green-400 md:text-2xl">
                {formatMRR(garden.totalMRR)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t("totalCustomers")}</div>
              <div className="font-['Silkscreen'] text-xl font-bold text-white md:text-2xl">
                {garden.totalCustomers.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {t("products", { count: garden.totalProducts })}
              </div>
              <div className="font-['Silkscreen'] text-xl font-bold text-white md:text-2xl">
                {garden.totalProducts}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {t("gardenSize.gardenSize")}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{gardenSizeInfo.emoji}</span>
                <span className="font-medium text-white">
                  {t(`gardenSize.${garden.gardenSize}`)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Garden Scene */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/30">
          <div className="h-[400px] w-full md:h-[500px]">
            <GardenScene trees={garden.products} plot={garden.plot} />
          </div>
        </div>

        {/* Product List */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">
            {t("productList")} ({garden.totalProducts})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {garden.products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Product Card Component
 */
function ProductCard({ product }: { product: TreeData }) {
  const categoryName = getCategoryDisplayName(product.category);
  const categoryColor = getCategoryColor(product.category);
  const tierEmoji = getTierEmoji(product.tier);

  return (
    <div className="group rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-green-500/30 hover:bg-gray-800/50">
      <div className="flex items-start gap-3">
        {product.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.icon}
            alt=""
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
            <TrendingUp className="h-6 w-6 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-white group-hover:text-green-400 transition-colors">
              {product.name}
            </h3>
            {product.onSale && (
              <Store className="h-4 w-4 flex-shrink-0 text-yellow-400" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
            <span>{tierEmoji}</span>
            <span className="font-mono text-green-400">
              {formatMRR(product.mrr)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {product.customers.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: `${categoryColor}22`,
                color: categoryColor,
              }}
            >
              {categoryName}
            </span>
            {product.growth30d !== null && product.growth30d !== undefined && (
              <span
                className={`text-xs ${
                  product.growth30d > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {product.growth30d > 0 ? "+" : ""}
                {Math.round(product.growth30d * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
