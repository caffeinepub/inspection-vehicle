import { ClipboardCheck } from "lucide-react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const socialLinks = [
    { Icon: SiGithub, href: "https://github.com", label: "GitHub" },
    { Icon: SiX, href: "https://x.com", label: "X (Twitter)" },
    { Icon: SiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];
  return (
    <footer
      style={{ background: "oklch(var(--navy))" }}
      className="text-white mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(var(--teal))" }}
              >
                <ClipboardCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">InspectWheels</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Professional vehicle inspection management. Streamline your
              inspection workflow from start to finish.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white/80 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2">
              {["Dashboard", "New Inspection", "Reports", "My Vehicles"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-white/60 text-sm cursor-default">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 text-white/80 uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2">
              {[
                "Documentation",
                "Help Center",
                "Contact Us",
                "Privacy Policy",
              ].map((item) => (
                <li key={item}>
                  <span className="text-white/60 text-sm cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {year}. Built with &#10084;&#65039; using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-white/70"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Icon className="w-4 h-4 text-white/60" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
