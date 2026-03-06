import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 text-green-400">
        {t("title")}
      </h1>
      <p className="text-lg md:text-xl text-center mb-8 max-w-2xl text-green-200">
        {t("description")}
      </p>
      <div className="flex gap-4">
        <Link
          href="/forest"
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
        >
          {t("exploreForest")}
        </Link>
        <Link
          href="/leaderboard"
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
        >
          {t("leaderboard")}
        </Link>
      </div>
    </main>
  );
}
