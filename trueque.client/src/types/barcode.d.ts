interface DetectedBarcode {
	rawValue: string
}

interface BarcodeScanner {
	detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>
}

interface Window {
	BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeScanner
}
