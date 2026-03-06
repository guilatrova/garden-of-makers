import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Search, ArrowLeft } from "lucide-react";

export default async function GardenNotFound() {
  const t = await getTranslations("GardenPage");

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <div className="mb-6 text-6xl">🌱</div>
          <h1 className="mb-4 font-['Silkscreen'] text-3xl font-bold text-white md:text-4xl">
            {t("notFound")}
          </h1>
          <p className="mb-8 text-gray-400">{t("notFoundDesc")}</p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/forest"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToForest")}
            </Link>

            <Link
              href="/forest"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              {t("searchInForest")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
