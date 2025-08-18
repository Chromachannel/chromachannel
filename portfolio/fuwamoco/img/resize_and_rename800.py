import os
from PIL import Image

# --- ▼ 設定項目 ▼ ---

# リサイズ後の画像の幅（ピクセル単位）
TARGET_WIDTH = 800  # ★★★ ここを 300 から 800 に変更 ★★★

# ファイル名の末尾に追加する接尾辞
SUFFIX = '_large'   # ★★★ ここを '_thumb' から '_large' などに変更 ★★★

# 処理対象の画像があるフォルダ（このスクリプトと同じ場所）
SOURCE_DIRECTORY = '.'

# --- ▲ 設定はここまで ▲ ---


def resize_and_rename_images():
    """
    カレントディレクトリ内のWebP画像をリサイズし、
    指定された接尾辞を付けて保存する。
    """
    print(f"--- 幅{TARGET_WIDTH}pxの画像リサイズ処理を開始します ---")
    
    try:
        files = os.listdir(SOURCE_DIRECTORY)
        processed_count = 0
    except FileNotFoundError:
        print(f"エラー: フォルダが見つかりません -> {os.path.abspath(SOURCE_DIRECTORY)}")
        return

    for filename in files:
        # WebP画像であり、かつ、まだリサイズされていない元画像のみを対象とする
        # (例: _thumb.webp や _large.webp で終わるファイルは無視する)
        if filename.lower().endswith('.webp') and '_thumb' not in filename.lower() and '_large' not in filename.lower():
            
            image_path = os.path.join(SOURCE_DIRECTORY, filename)
            
            try:
                with Image.open(image_path) as img:
                    width, height = img.size
                    if width == 0: continue
                    
                    # ★★★ アスペクト比を厳密に16:9 (高さ = 幅 * 9/16) に固定するロジックを追加 ★★★
                    new_height = int(TARGET_WIDTH * 9 / 16)

                    resized_img = img.resize((TARGET_WIDTH, new_height), Image.Resampling.LANCZOS)
                    
                    name, ext = os.path.splitext(filename)
                    new_filename = f"{name}{SUFFIX}{ext}"
                    
                    output_path = os.path.join(SOURCE_DIRECTORY, new_filename)
                    resized_img.save(output_path, 'WEBP')
                    
                    print(f"処理成功: {filename} -> {new_filename} ({TARGET_WIDTH} x {new_height})")
                    processed_count += 1

            except Exception as e:
                print(f"エラー: {filename} の処理に失敗しました。理由: {e}")

    if processed_count == 0:
        print("\n処理対象の新しいWebP画像が見つかりませんでした。")
    else:
        print(f"\n--- 処理完了 ---")
        print(f"{processed_count}個の画像をリサイズしました。")


if __name__ == "__main__":
    resize_and_rename_images()