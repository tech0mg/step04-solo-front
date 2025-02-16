    // components/BarcodeScanner.tsx
    import { useEffect, useRef, useState } from "react";
    import Quagga from "@ericblade/quagga2";

    interface BarcodeScannerProps {
    onScan: (code: string) => void;
    }

    const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isScanning && videoRef.current) {
        Quagga.init(
            {
            inputStream: {
                type: "LiveStream",
                target: videoRef.current,
                constraints: {
                facingMode: "environment", // 背面カメラをデフォルト
                },
            },
            decoder: {
                readers: ["ean_reader"], // EAN-13用
            },
            },
            (err) => {
            if (!err) {
                Quagga.start();
            }
            }
        );

        Quagga.onDetected((result) => {
            const scannedCode = result.codeResult.code;
            if (scannedCode) { // nullチェック
            Quagga.stop();
            setIsScanning(false);
            onScan(scannedCode);
            }
        });

        return () => {
            Quagga.stop();
        };
        }
    }, [isScanning]);

    return (
        <div>
        {!isScanning ? (
            <button onClick={() => setIsScanning(true)}>商品をスキャンする</button>
        ) : (
            <div ref={videoRef} style={{ width: "100%", height: "300px" }}></div>
        )}
        </div>
    );
    };

    export default BarcodeScanner;
