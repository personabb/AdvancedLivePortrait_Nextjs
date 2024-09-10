# AdvancedLivePortrait_Nextjs
本リポジトリは、ComfyUIで利用可能なカスタムノードである、「[ComfyUI-AdvancedLivePortrait](https://github.com/PowerHouseMan/ComfyUI-AdvancedLivePortrait)」をNext.jsで作成したWebアプリ上で動作させるプロジェクトです。

実行例は下記のYoutubeの動画をご覧ください

https://youtu.be/wQsF2_ucioM

使い方などの詳細は下記の記事に記載しています。そちらをご覧ください

工事中

## 動作確認済み環境
フロントエンド:M2 Mac

バックエンド: M2 Mac or Ubuntu20.04　or Google Colab

（GPUを利用したローカルサーバを推奨しますが、GPUなしでも動作はします。）

## 前提条件
pythonとNext.jsが動作すること

## 簡易版説明書（ローカルでの利用）
### バックエンド
#### パッケージのインストール
```bash
cd AdvancedLivePortrait_Nextjs/alp_backend

#仮想環境の構築
python -m venv env
source env/bin/activate

# パッケージのインストール
git clone https://github.com/PowerHouseMan/ComfyUI-AdvancedLivePortrait.git
pip install fastapi\[all\]
cd ComfyUI-AdvancedLivePortrait
pip install -r requirements.txt
cd ..

```

#### バックエンドサーバの起動
```bash
python run.py

```

### フロントエンド
#### バックエンドサーバのURLを指定
`.env.local`をリポジトリ直下（`./AdvancedLivePortrait_Nextjs/`）に作成して、下記の通り設定してください。
URLはバックエンドサーバのURLです。(以下は例です)

```
NEXT_PUBLIC_API_BASE_URL=http://192.168.0.xxx:8000

```

（バックエンドサーバのプライベートIPアドレスを予め確認しておいてください。ポートは8000です）

#### 必要なパッケージのインストール
```bash
cd AdvancedLivePortrait_Nextjs

pnpm i
pnpm build
```

#### バックエンドサーバの起動
```bash
pnpm dev
```

### Webアプリへの接続
下記のURLに接続してください。
```
http://localhost:3000/
```