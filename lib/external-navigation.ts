import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export async function openExternalUrl(url: string) {
  if (typeof window === "undefined") return;

  if (Capacitor.isNativePlatform()) {
    if (new URL(url).hostname === "wa.me") {
      // Let Capacitor's WebView client hand WhatsApp links to Android intents.
      window.location.assign(url);
      return;
    }

    await Browser.open({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function callPhoneNumber(phoneNumber: string) {
  if (typeof window === "undefined") return;
  window.location.assign(`tel:${phoneNumber}`);
}

export async function openBlobFile(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;

  if (Capacitor.isNativePlatform()) {
    const data = await blobToBase64(blob);
    const file = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
    });

    await Share.share({
      title: filename,
      url: file.uri,
      dialogTitle: "Open invoice",
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Shares a URL via the native share sheet on Capacitor platforms, or copies
// it to the clipboard on web. Mirrors the Capacitor.isNativePlatform()
// branching used by openBlobFile above -- the same Share plugin, just with a
// url payload instead of a locally-written file. Callers use the return
// value to decide whether a "Link copied" confirmation makes sense (it only
// does on the clipboard path -- the native share sheet is its own feedback).
export async function shareTripLink(url: string): Promise<"native" | "clipboard"> {
  if (typeof window === "undefined") return "clipboard";

  if (Capacitor.isNativePlatform()) {
    await Share.share({ url });
    return "native";
  }

  await navigator.clipboard.writeText(url);
  return "clipboard";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unable to read file"));
        return;
      }

      resolve(result.slice(result.indexOf(",") + 1));
    };

    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(blob);
  });
}
