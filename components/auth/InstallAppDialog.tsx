"use client";

type Props = {
  onInstall: () => void;
  onSkip: () => void;
};

export default function InstallAppDialog({ onInstall, onSkip }: Props) {
  return (
    <div className="lux-modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="lux-panel w-full max-w-sm rounded-2xl p-6 space-y-4 text-white">
        <h3 className="text-lg font-semibold text-center">
          Install Luxorides App
        </h3>

        <p className="text-sm text-white/70 text-center">
          Get faster access, app-like experience, and quick bookings.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onSkip}
            className="lux-control flex-1 h-11 rounded-xl"
          >
            Continue on Web
          </button>

          <button
            onClick={onInstall}
            className="flex-1 h-11 rounded-xl bg-white text-black hover:bg-white/90 font-medium"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
