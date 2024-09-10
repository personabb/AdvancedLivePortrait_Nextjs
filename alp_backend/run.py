import sys
sys.path.append("./ComfyUI-AdvancedLivePortrait")

from fastapi import FastAPI, UploadFile,File, Form
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from module.advanced_live_portrait import AdvancedLivePortrait_execution_prepare, AdvancedLivePortrait_execution_main

app = FastAPI()

# CORSの設定
origins = [
    "*" # フロントエンドのURLを指定
    # 必要に応じて他のオリジンを追加
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)

editor = None
img_tensor = None
prepared_face = None


@app.post("/initialize")
async def initialize_image_endpoint(file: UploadFile = File(...)):
    global editor, img_tensor, prepared_face
    # アップロードされた画像を一時ファイルに保存
    input_image_path = f"./tmp/{file.filename}"
    output_image_path = f"./tmp/initialized_{file.filename}"
    os.makedirs(os.path.dirname(input_image_path), exist_ok=True)
    
    with open(input_image_path, "wb") as f:
        f.write(await file.read())
    
    # 初期化処理を実行
    editor, img_tensor, prepared_face = AdvancedLivePortrait_execution_prepare(input_image_path, output_image_path)
    
    # 初期化完了メッセージを返す
    return JSONResponse(content={"message": "初期化が完了しました", "status": "success"})

# 画像編集関数（AdvancedLivePortrait_executionのラッパー）
def edit_image(output_path, parameters):
    # ここにAdvancedLivePortrait_execution関数を呼び出すコードを記載
    # parametersはNext.jsから送られてくるパラメータ
    edited_image_pil = AdvancedLivePortrait_execution_main(editor, img_tensor, prepared_face, output_path, parameters)
    # メモリバッファに画像を保存
    img_byte_arr = io.BytesIO()
    edited_image_pil.save(img_byte_arr, format='PNG')  # PNG形式で保存（JPEGでも可）
    img_byte_arr.seek(0)  # バッファの先頭にポインタを移動

    return img_byte_arr

@app.post("/edit")
async def edit_image_endpoint(
    file: UploadFile = File(...),
    rotate_pitch: float = Form(0),
    rotate_yaw: float = Form(0),
    rotate_roll: float = Form(0),
    blink: float = Form(0),
    eyebrow: float = Form(0),
    wink: float = Form(0),
    pupil_x: float = Form(0),
    pupil_y: float = Form(0),
    aaa: float = Form(0),
    eee: float = Form(0),
    woo: float = Form(0),
    smile: float = Form(0.5),
):
    # アップロードされた画像を一時ファイルに保存
    input_image_path = f"./tmp/{file.filename}"
    output_image_path = f"./tmp/edited_{file.filename}"

    with open(input_image_path, "wb") as f:
        f.write(await file.read())

    # パラメータをAdvancedLivePortrait_executionに渡して編集を行う
    parameters = [
        rotate_pitch, rotate_yaw, rotate_roll, blink, eyebrow, wink,
        pupil_x, pupil_y, aaa, eee, woo, smile
    ]

    print(f"Received parameters: {parameters}")
    img_byte_arr = edit_image(output_image_path, parameters)

    # 編集された画像を返す
    #return FileResponse(output_image_path)
    return StreamingResponse(img_byte_arr, media_type="image/png")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("run:app", host="0.0.0.0", port=8000, reload=True)


