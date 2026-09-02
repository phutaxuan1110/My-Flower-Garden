import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, Sprout, User } from "lucide-react";
import { useGarden } from "../store/GardenProvider";
import { useToast } from "../hooks/useToast";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { gardenRepository } from "../lib/repository";

export function ProfilePage() {
  const { profile, updateProfile, totalCount } = useGarden();
  const { show } = useToast();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [gardenName, setGardenName] = useState(profile?.gardenName ?? "");
  const [confirmReset, setConfirmReset] = useState(false);

  async function handleSave() {
    await updateProfile({ displayName: displayName.trim() || "Friend", gardenName: gardenName.trim() || "My Flower Garden" });
    show("Profile updated");
  }

  async function handleReset() {
    localStorage.clear();
    setConfirmReset(false);
    window.location.reload();
  }

  async function replayOnboarding() {
    await gardenRepository.setOnboardingComplete(false);
    navigate("/onboarding");
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-ink)]">
          <User size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-xl text-[var(--color-ink)]">{profile?.displayName ?? "Friend"}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {totalCount} {totalCount === 1 ? "bouquet" : "bouquets"} saved
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="display-name">
            Your name
          </label>
          <input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]" htmlFor="garden-name">
            Garden name
          </label>
          <input
            id="garden-name"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
            className="min-h-[44px] w-full rounded-2xl border border-[var(--color-line)] bg-white px-3.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-rose)]"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="min-h-[44px] w-full rounded-full bg-[var(--color-rose)] text-sm font-semibold text-white shadow-md shadow-[var(--color-rose)]/30 active:scale-95"
        >
          Save changes
        </button>
      </div>

      <div className="mt-8 space-y-2">
        <button
          type="button"
          onClick={replayOnboarding}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[var(--color-line)] text-sm font-medium text-[var(--color-ink)]"
        >
          <Sprout size={15} /> Replay onboarding
        </button>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-[var(--color-rose)]"
        >
          <RotateCcw size={15} /> Reset all garden data
        </button>
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-[var(--color-muted)]">
        This demo stores your garden on this device only. Photos, bouquets and placements are saved locally and
        will still be here after you refresh.
      </p>

      <ConfirmationDialog
        open={confirmReset}
        title="Reset all garden data?"
        description="This permanently deletes every bouquet, photo and placement on this device."
        confirmLabel="Reset everything"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
