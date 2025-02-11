import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

// 設定オブジェクトを作成する関数
const createConfig = (props) => {
    let config = {};
    if (props.fps) config.fps = props.fps;               // スキャンのフレームレート
    if (props.qrbox) config.qrbox = props.qrbox;         // QRコードを検出する領域
    if (props.aspectRatio) config.aspectRatio = props.aspectRatio; // カメラのアスペクト比
    if (props.disableFlip !== undefined) config.disableFlip = props.disableFlip; // ミラーリングの有無
    return config;
};

const Html5QrcodePlugin = (props) => {
    useEffect(() => {
        const config = createConfig(props);
        const verbose = props.verbose === true;

        if (!props.qrCodeSuccessCallback) {
            throw new Error("qrCodeSuccessCallback は必須です。");
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

        // コンポーネントのクリーンアップ
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("html5QrcodeScanner のクリーンアップに失敗しました:", error);
            });
        };
    }, []);

    return <div id={qrcodeRegionId} />;
};

export default Html5QrcodePlugin;
