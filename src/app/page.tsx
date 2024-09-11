"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ローディング状態の管理
  const [isUpdating, setIsUpdating] = useState(false); // 画像処理中でもスライダー操作を許可するためのフラグ
  const [isInitializing, setIsInitializing] = useState(false); // 初期化処理中の状態を管理

  // 環境変数からAPIベースURLを取得
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // スライダーで調整するパラメータの状態を管理
  const [params, setParams] = useState({
    rotate_pitch: 0,
    rotate_yaw: 0,
    rotate_roll: 0,
    blink: 0,
    eyebrow: 0,
    wink: 0,
    pupil_x: 0,
    pupil_y: 0,
    aaa: 0,
    eee: 0,
    woo: 0,
    smile: 0, // 初期値は0
  });

  const sliderDescriptions: { [key: string]: string } = {
    rotate_pitch: "顔の縦方向の回転（前後）",
    rotate_yaw: "顔の横方向の回転（左右）",
    rotate_roll: "顔の傾き",
    blink: "瞬きの度合い",
    eyebrow: "眉毛の動き",
    wink: "片目のウインク",
    pupil_x: "瞳の左右の動き",
    pupil_y: "瞳の上下の動き",
    aaa: "口を開ける動作",
    eee: "口を「イ」と発音する動作",
    woo: "口を「ウ」と発音する動作",
    smile: "笑顔の度合い（0.5 = 50%笑顔）",
  };

  // パラメータが変更された時に呼び出される関数
  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: parseFloat(value),
    }));
    console.log(`Updated ${name} to ${value}`);
  };

  // APIに画像とパラメータを送信する非同期関数
  const sendUpdateToBackend = useCallback(
    debounce(async (newParams) => {
      if (image) {
        setIsUpdating(true); // 処理が開始されたことを示す
        setLoading(true);

        const formData = new FormData();
        formData.append("file", image);
        Object.keys(newParams).forEach((key) => {
          formData.append(key, String(newParams[key as keyof typeof params]));
        });

        try {
          const response = await fetch(`${API_BASE_URL}/edit`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const blob = await response.blob();
          const editedImageURL = URL.createObjectURL(blob);
          setPreview(editedImageURL);
        } catch (error) {
          console.error("Error while sending API request:", error);
        } finally {
          setLoading(false); // ローディング終了
          setIsUpdating(false); // 画像処理終了を示す
        }
      }
    }, 200), // 500msの遅延を設定
    [image, API_BASE_URL]
  );

  // パラメータが変更された時にdebounced処理を呼び出す
  useEffect(() => {
    if (image) {
      sendUpdateToBackend(params);
    }
  }, [params, sendUpdateToBackend]);

  // 初期化処理用のAPIリクエスト関数を追加
  const initializeImage = async (imageFile: File) => {
    const formData = new FormData();
    formData.append("file", imageFile);
  
    try {
      setIsInitializing(true); // 初期化開始
      const response = await fetch(`${API_BASE_URL}/initialize`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Initialization API request failed with status ${response.status}`);
      }
  
      const result = await response.json();  // JSONレスポンスを取得
      console.log(result.message);  // "初期化が完了しました" と表示されるはず
    } catch (error) {
      console.error("Error during initialization API request:", error);
    } finally {
      setIsInitializing(false); // 初期化終了
    }   
  };
  
  // 画像を選択した際にプレビューを表示するための関数
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      initializeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // リセットボタンのハンドラー
  const handleReset = () => {
    setParams({
      rotate_pitch: 0,
      rotate_yaw: 0,
      rotate_roll: 0,
      blink: 0,
      eyebrow: 0,
      wink: 0,
      pupil_x: 0,
      pupil_y: 0,
      aaa: 0,
      eee: 0,
      woo: 0,
      smile: 0,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">画像編集ツール</h1>

      <div className="flex">
        {/* 画像プレビュー */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mb-4 h-auto object-contain mr-8" // 画像の右側に空白を追加
            style={{ width: '512px', height: '512px' }} // プレビュー画像のサイズを固定
          />
        )}

        {/* スライダーを縦に配置 */}
        <div className="flex flex-col items-start justify-center w-1/2 space-y-4">
          {Object.keys(params).map((param) => (
            <div key={param} className="flex items-center space-x-4">
              {/* スライダーの名称 */}
              <label className="w-32">{param}</label>
              
              {/* スライダー */}
              <input
                type="range"
                name={param}
                min={param === "smile" ? "-2" : "-20"} // smileだけ-2から2、他は-20から20
                max={param === "smile" ? "2" : "20"}
                step={param === "smile" ? "0.1" : "1"} // どちらも0.1ステップ
                value={params[param as keyof typeof params]}
                onChange={handleParamChange}
                className="w-48 h-4" // スライダーの幅を広く、少し太く
                disabled={isInitializing} // 初期化中はスライダーを無効化
              />

              {/* 数値入力フィールド */}
              <input
                type="number"
                name={param}
                min={param === "smile" ? "-2" : "-20"} // smileだけ-2から2、他は-20から20
                max={param === "smile" ? "2" : "20"}
                step={param === "smile" ? "0.1" : "1"}
                value={params[param as keyof typeof params]}
                onChange={handleParamChange}
                className="w-16 p-1 border rounded"
                disabled={isInitializing} // 初期化中はスライダーを無効化
              />

              {/* 補足説明 */}
              <span className="text-gray-500">{sliderDescriptions[param]}</span>
            </div>
          ))}

          {/* リセットボタン */}
          <button
            onClick={handleReset}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            disabled={isInitializing} // 初期化中はリセットボタンも無効化
          >
            リセット
          </button>
        </div>
      </div>

      {/* 画像アップロード */}
      <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4" />

      {loading && <p>画像を処理中...</p>}
      {isUpdating && !loading && <p>新しい画像を処理中...</p>}
    </div>
  );
}
