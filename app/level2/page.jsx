// Level2課題
'use client';
import { useState, useRef, useEffect } from "react";
import Html5QrcodePlugin from './Html5QrcodePlugin';
import BarcodeScanner from './quagga2';

export default function POS() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState({});
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState(""); // スキャンしたバーコード
  const [scannerActive, setScannerActive] = useState(false); // スキャナーの表示状態
  const [scannedCode, setScannedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);


  // 環境変数の読み取り
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 商品検索関数（スキャンしたバーコードを使う）
  const fetchProduct = async (code) => {
    try {
        const res = await fetch(`${apiUrl}/api/product?code=${code}`);
        if (!res.ok) {
            throw new Error(`APIエラー: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (data.error) {
            alert(data.error);
        } else {
            setProduct(data);
        }
    } catch (error) {
        console.error("商品情報の取得に失敗:", error);
        alert("商品情報の取得に失敗しました");
    }
  };

  // QRコードの読み取り結果を処理（スキャン後に商品検索を実行）
  const onNewScanResult = (decodedText) => {
    if (/^\d{13}$/.test(decodedText)) { // 13桁の数字かチェック
        setBarcode(decodedText);
        setScannerActive(false); // スキャン後にスキャナーを閉じる
        fetchProduct(decodedText); // 取得したコードで商品検索を実行
    } else {
        alert("無効なバーコードです");
    }
  };

  const handleScan = async (code) => {
    console.log("スキャン結果:", code);
    setScannedCode(code);
    await fetchProduct(code);
  };

  /* 商品検索
  const fetchProduct = async () => {
    try {
        const res = await fetch(`${apiUrl}/api/product?code=${code}`);
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (data.error) {
            alert(data.error);
        } else {
            setProduct(data);
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        alert("商品情報の取得に失敗しました");
    }
  };
  */

  // カートに商品を追加
  const addToCart = (product) => {
    if (!product || !product.prd_id) {
        alert("商品がマスタ未登録です");
        return;
    }
    setCart((prevCart) => [...prevCart, product]); // カートに追加
    setCode(""); // 検索欄をクリア
    setProduct({}); // 商品情報をリセット
};


  // カートの商品の合計値を計算
  const calculateTotal = (cart) => {
    return cart.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  };
  
  // カートの商品を購入
  const saveTransaction = async (cart,totalAmount) => {
    if (cart.length === 0) return;
  
    try {
      // ① 取引情報をDBに登録して `transaction_id` を取得
      const transactionResponse = await fetch(`${apiUrl}/api/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_amt: totalAmount,
          emp_cd: 9999, // レジ担当者コード
          store_cd: 30, // 店舗コード
          pos_no: 90 // POS機ID
        }),
      });
  
      const transactionData = await transactionResponse.json();
      const transactionId = transactionData.trd_id; // 取得した `trd_id`
  
      console.log("Transaction ID:", transactionId);
  
      // ② 取引明細を登録（`transaction_id` を組み込む）
      const transactionDetails = cart.map((cart) => ({
        trd_id: transactionId, // DBから取得した `transaction_id`
        prd_id: cart.prd_id,
        prd_code: cart.code,
        prd_name: cart.name,
        prd_price: cart.price,
      }));
  
      await fetch(`${apiUrl}/api/transaction/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: transactionDetails }),
      });
  
      console.log("Transaction details saved successfully!");
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };
  
  const purchase = () => {
    const totalAmount = calculateTotal(cart);
    window.alert(`合計金額は ${totalAmount} 円です`);
    saveTransaction(cart, totalAmount);
    setCart([]); // カートをリセット
  };

  return (
    <div className="container flex flex-wrap p-6">
      {/* 左側の入力・追加パネル */}
      <div className="left-panel flex flex-col basis-1/2 p-6">
        {/* Html5利用時読み取り機能
        <button
          onClick={() => setScannerActive(true)}
          className="button m-3"
        >スキャン（カメラ）</button>

        QRコードスキャナー（ボタンを押したときのみ表示） 
        {scannerActive && (
            <Html5QrcodePlugin
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult} // スキャン成功時の処理
            />
        )}
        */}

        {!isScanning && (
          <button onClick={() => setIsScanning(true)} className="button m-3">
            スキャンを開始
          </button>
        )}
        {/* スキャナーを表示 */}
        <BarcodeScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />

        {/* スキャン結果表示 */}
        {scannedCode && <p>スキャンされたコード: {scannedCode}</p>}




        {/* スキャン後の情報表示 */}
        {product ? (
            <div className="p-4">
                <h2>商品情報</h2>
                <p className="input-box m-3 p-4">商品コード: {product.code}</p>
                <p className="input-box m-3 p-4">商品名: {product.name}</p>
                <p className="input-box m-3 p-4">価格: {product.price}円</p>
                <button 
                  onClick={() => addToCart(product)}
                  className="button m-3"
                >
                  追加
                </button>
            </div>
        ) : (
            barcode && <p>商品情報が見つかりませんでした</p>
        )}
      </div>

      {/* 右側の購入リスト */}
      <div className="right-panel flex flex-col basis-1/2 p-6">
        <div className="purchase-list m-3 p-4">
          <h3 className="text-center">購入リスト</h3>
          <ul className="p-3">
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} ×１ {item.price}円
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={purchase}
          className="purchase-button m-3"
        >
          購入
        </button>
      </div>
    </div>
  );
}