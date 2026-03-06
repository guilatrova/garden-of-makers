import { useTranslations } from "next-intl";

export default function ForestPage() {
  const t = useTranslations("ForestPage");

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
        {t("title")}
      </h1>
      <p className="text-green-200 mb-8">{t("description")}</p>
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-8 text-center">
        <p className="text-green-300">{t("comingSoon")}</p>
      </div>
    </main>
  );
}
