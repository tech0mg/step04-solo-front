'use client';
import { useState, useEffect } from "react";

export default function POS() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState({});
  const [cart, setCart] = useState([]);

  // 環境変数の読み取り
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 商品検索
  const fetchProduct = async () => {
    try {
        const res = await fetch(`https://tech0-gen8-step4-pos-app-16.azurewebsites.net/api/product?code=${code}`);
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
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="バーコードを入力"
          className="input-box m-3"
        />
        <button
          onClick={fetchProduct}
          className="button m-3"
        >
          商品コード 読み込み
        </button>

        {product && (
          <div className="product-info m-3 p-4">
            <p>商品名: {product.name}</p>
            <p>価格: {product.price}円</p>
            <button 
              onClick={() => addToCart(product)}
              className="button m-3"
            >
              追加
            </button>
          </div>
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