import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Redirect root to default locale
 */
export default function RootPage() {
  notFound();
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
