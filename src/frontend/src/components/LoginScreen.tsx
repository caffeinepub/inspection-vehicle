import { Button } from "@/components/ui/button";
import { Car, CheckCircle, ClipboardCheck, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  { Icon: CheckCircle, text: "Multi-step inspection checklists" },
  { Icon: ClipboardCheck, text: "Photo documentation & storage" },
  { Icon: Shield, text: "Role-based access control" },
];

export default function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(var(--navy))" }}
    >
      <header className="px-8 py-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(var(--teal))" }}
        >
          <ClipboardCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-white text-xl font-bold tracking-tight">
          InspectWheels
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "oklch(var(--teal) / 0.1)" }}
            >
              <Car
                className="w-8 h-8"
                style={{ color: "oklch(var(--teal))" }}
              />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              Welcome to InspectWheels
            </h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              Professional vehicle inspection management platform. Log in to
              access your inspections dashboard.
            </p>

            <div className="space-y-3 mb-8 text-left">
              {FEATURES.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(var(--teal) / 0.1)" }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "oklch(var(--teal))" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            <Button
              data-ocid="login.primary_button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full h-11 text-base font-semibold"
              style={{ background: "oklch(var(--navy))", color: "white" }}
            >
              {isLoggingIn ? "Connecting..." : "Sign In to Continue"}
            </Button>
          </div>
        </motion.div>
      </div>

      <footer className="py-4 text-center">
        <p className="text-white/40 text-xs">
          &copy; {new Date().getFullYear()} Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
