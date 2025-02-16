    import { useEffect, useRef } from "react";
    import Quagga from "@ericblade/quagga2";

    const BarcodeScanner = ({ onScan, isScanning, setIsScanning }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (isScanning && videoRef.current) {
        Quagga.init(
            {
            inputStream: {
                type: "LiveStream",
                target: videoRef.current,
                constraints: {
                facingMode: "environment",
                },
            },
            decoder: {
                readers: ["ean_reader"],
            },
            },
            (err) => {
            if (!err) {
                Quagga.start();
            }
            }
        );

        Quagga.onDetected((result) => {
            Quagga.stop();
            setIsScanning(false);
            const scannedCode = result.codeResult.code;
            onScan(scannedCode); // 親コンポーネントへスキャン結果を渡す
        });

        return () => {
            Quagga.stop();
        };
        }
    }, [isScanning, onScan, setIsScanning]);

    return isScanning ? <div ref={videoRef} style={{ width: "100%", height: "300px" }}></div> : null;
    };

    export default BarcodeScanner;
