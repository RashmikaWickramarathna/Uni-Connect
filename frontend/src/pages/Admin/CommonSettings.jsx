import { FiMonitor, FiMoon, FiSettings, FiSun } from "react-icons/fi";

import AdminLayout from "../../components/AdminLayout";
import { useTheme } from "../../context/ThemeContext";

const THEME_OPTIONS = [
  {
    value: "light",
    title: "Light",
    description: "Bright workspace for daytime use.",
    icon: FiSun,
  },
  {
    value: "dark",
    title: "Dark",
    description: "Low-glare mode for focused work.",
    icon: FiMoon,
  },
  {
    value: "system",
    title: "System",
    description: "Follow the device appearance automatically.",
    icon: FiMonitor,
  },
];

export default function CommonSettings() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <AdminLayout title="Common Settings" subtitle="Manage the shared admin appearance and system preferences.">
      <div className="page-header split">
        <div>
          <h2>Common Settings</h2>
          <p>
            Theme changes are saved locally and applied across the whole Uni-Connect interface.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-icon-box">
              <FiSettings />
            </div>
            <div>
              <h3>Appearance</h3>
              <p>Choose how the system should look on admin and user-facing pages.</p>
            </div>
          </div>

          <div className="theme-choice-grid">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`theme-choice${isSelected ? " is-active" : ""}`}
                  onClick={() => setTheme(option.value)}
                >
                  <span className="theme-choice-icon">
                    <Icon />
                  </span>
                  <span className="theme-choice-copy">
                    <strong>{option.title}</strong>
                    <small>{option.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-icon-box secondary">
              {resolvedTheme === "dark" ? <FiMoon /> : <FiSun />}
            </div>
            <div>
              <h3>Current Preference</h3>
              <p>
                Stored preference: <strong>{theme}</strong>. Active mode:{" "}
                <strong>{resolvedTheme}</strong>.
              </p>
            </div>
          </div>

          <div className="settings-preview">
            <div className="settings-preview-bar">
              <span className="settings-dot" />
              <span className="settings-dot" />
              <span className="settings-dot" />
            </div>
            <div className="settings-preview-body">
              <div className="settings-preview-sidebar" />
              <div className="settings-preview-content">
                <div className="settings-preview-card large" />
                <div className="settings-preview-card-row">
                  <div className="settings-preview-card" />
                  <div className="settings-preview-card" />
                </div>
              </div>
            </div>
          </div>

          <p className="section-sub">
            Use <strong>System</strong> if you want Uni-Connect to switch automatically when your
            device changes between light and dark mode.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}
