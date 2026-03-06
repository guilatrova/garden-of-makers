/**
 * Footer Component
 * Simple footer for all pages except /forest
 */

import { useTranslations } from "next-intl";
import { Github, ExternalLink } from "lucide-react";

export function Footer() {
  const t = useTranslations("HomePage");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900/90 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left side */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>© {currentYear} Garden of Makers</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            <a
              href="https://trustmrr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              {t("footer.poweredBy")}
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://x.com/guilatrova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              {t("footer.builtBy")} @guilatrova
            </a>
            <a
              href="https://github.com/guilatrova/garden-of-makers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              <Github className="h-4 w-4" />
              {t("footer.source")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
