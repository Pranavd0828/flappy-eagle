
import os
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_PATH = os.path.join(BASE_DIR, "app-icon.png")
LOGO_PATH = os.path.join(BASE_DIR, "logo-512.png")
DEST_DIR = os.path.join(BASE_DIR, "ios/App/App/Assets.xcassets/Splash.imageset")

if not os.path.exists(DEST_DIR):
    os.makedirs(DEST_DIR)

print(f"Generating Splash from {ICON_PATH} to {DEST_DIR}")

# 1. Resize icon to 512x512 (logo)
cmd1 = ["sips", "-Z", "512", ICON_PATH, "--out", LOGO_PATH]
subprocess.check_call(cmd1)

# 2. Pad to 2732x2732 with white background
# sips --padToHeightWidth <height> <width> --padColor <hex> <input>
splash_files = ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]
for f in splash_files:
    out_path = os.path.join(DEST_DIR, f)
    # Using padColor FFFFFF for white
    cmd2 = ["sips", "--padToHeightWidth", "2732", "2732", "--padColor", "FFFFFF", LOGO_PATH, "--out", out_path]
    print(f"Creating {f}...")
    subprocess.check_call(cmd2)

os.remove(LOGO_PATH)
print("Splash screens generated.")
