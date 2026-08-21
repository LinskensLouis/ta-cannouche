// Abstraction de scan (S2-01). Utilise l'API native `BarcodeDetector`
// (Android/Chrome) quand elle existe, sinon bascule sur @zxing/browser
// (Safari iOS). Une seule surface pour l'écran de scan.

export type ScanController = { stop: () => void };

// Type minimal de l'API native (non typée par lib.dom dans toutes les versions).
type NativeBarcode = { rawValue: string };
type NativeDetector = { detect: (source: HTMLVideoElement) => Promise<NativeBarcode[]> };
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => NativeDetector;

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];

function nativeDetector(): NativeDetector | null {
  const ctor = (globalThis as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (!ctor) return null;
  try {
    return new ctor({ formats: FORMATS });
  } catch {
    return null;
  }
}

// Démarre le flux caméra dans `video` et appelle `onResult` au premier code lu.
// Lance une erreur si la caméra est refusée/indisponible (gérée par l'appelant).
export async function startScan(
  video: HTMLVideoElement,
  onResult: (code: string) => void,
): Promise<ScanController> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();

  let stopped = false;
  const stopStream = () => {
    stopped = true;
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  };

  const native = nativeDetector();

  if (native) {
    const tick = async () => {
      if (stopped) return;
      try {
        const codes = await native.detect(video);
        const first = codes[0];
        if (first?.rawValue) {
          stopStream();
          onResult(first.rawValue);
          return;
        }
      } catch {
        // image non prête : on réessaie à la frame suivante
      }
      requestAnimationFrame(() => void tick());
    };
    void tick();
    return { stop: stopStream };
  }

  // Repli iOS : @zxing/browser, chargé à la demande.
  const { BrowserMultiFormatReader } = await import("@zxing/browser");
  const reader = new BrowserMultiFormatReader();
  const controls = await reader.decodeFromVideoElement(video, (result) => {
    if (stopped) return;
    if (result) {
      controls.stop();
      stopStream();
      onResult(result.getText());
    }
  });

  return {
    stop: () => {
      controls.stop();
      stopStream();
    },
  };
}
