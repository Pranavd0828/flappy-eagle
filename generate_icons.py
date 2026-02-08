
import os
import subprocess
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ICON_PATH = os.path.join(BASE_DIR, "app-icon.png")
TARGET_DIR = os.path.join(BASE_DIR, "ios/App/App/Assets.xcassets/AppIcon.appiconset")

print(f"Base Dir: {BASE_DIR}")
print(f"Icon Path: {ICON_PATH}")
print(f"Target Dir: {TARGET_DIR}")

# Ensure target directory exists
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

# File names and sizes
# (size, scale, filename)
images = [
    (20, 1, "AppIcon-20x20@1x.png"),
    (20, 2, "AppIcon-20x20@2x.png"),
    (20, 3, "AppIcon-20x20@3x.png"),
    (29, 1, "AppIcon-29x29@1x.png"),
    (29, 2, "AppIcon-29x29@2x.png"),
    (29, 3, "AppIcon-29x29@3x.png"),
    (40, 1, "AppIcon-40x40@1x.png"),
    (40, 2, "AppIcon-40x40@2x.png"),
    (40, 3, "AppIcon-40x40@3x.png"),
    (60, 2, "AppIcon-60x60@2x.png"),
    (60, 3, "AppIcon-60x60@3x.png"),
    (76, 1, "AppIcon-76x76@1x.png"),
    (76, 2, "AppIcon-76x76@2x.png"),
    (83.5, 2, "AppIcon-83.5x83.5@2x.png"),
    (1024, 1, "AppIcon-1024x1024@1x.png")
]

# Hardcoded standard contents.json structure to match Xcode expectations
contents_json = {
  "images": [
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "AppIcon-20x20@2x.png",
      "scale": "2x"
    },
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "AppIcon-20x20@3x.png",
      "scale": "3x"
    },
    {
      "size": "29x29",
      "idiom": "iphone",
      "filename": "AppIcon-29x29@2x.png",
      "scale": "2x"
    },
    {
      "size": "29x29",
      "idiom": "iphone",
      "filename": "AppIcon-29x29@3x.png",
      "scale": "3x"
    },
    {
      "size": "40x40",
      "idiom": "iphone",
      "filename": "AppIcon-40x40@2x.png",
      "scale": "2x"
    },
    {
      "size": "40x40",
      "idiom": "iphone",
      "filename": "AppIcon-40x40@3x.png",
      "scale": "3x"
    },
    {
      "size": "60x60",
      "idiom": "iphone",
      "filename": "AppIcon-60x60@2x.png",
      "scale": "2x"
    },
    {
      "size": "60x60",
      "idiom": "iphone",
      "filename": "AppIcon-60x60@3x.png",
      "scale": "3x"
    },
    {
      "size": "20x20",
      "idiom": "ipad",
      "filename": "AppIcon-20x20@1x.png",
      "scale": "1x"
    },
    {
      "size": "20x20",
      "idiom": "ipad",
      "filename": "AppIcon-20x20@2x.png",
      "scale": "2x"
    },
    {
      "size": "29x29",
      "idiom": "ipad",
      "filename": "AppIcon-29x29@1x.png",
      "scale": "1x"
    },
    {
      "size": "29x29",
      "idiom": "ipad",
      "filename": "AppIcon-29x29@2x.png",
      "scale": "2x"
    },
    {
      "size": "40x40",
      "idiom": "ipad",
      "filename": "AppIcon-40x40@1x.png",
      "scale": "1x"
    },
    {
      "size": "40x40",
      "idiom": "ipad",
      "filename": "AppIcon-40x40@2x.png",
      "scale": "2x"
    },
    {
      "size": "76x76",
      "idiom": "ipad",
      "filename": "AppIcon-76x76@1x.png",
      "scale": "1x"
    },
    {
      "size": "76x76",
      "idiom": "ipad",
      "filename": "AppIcon-76x76@2x.png",
      "scale": "2x"
    },
    {
      "size": "83.5x83.5",
      "idiom": "ipad",
      "filename": "AppIcon-83.5x83.5@2x.png",
      "scale": "2x"
    },
    {
      "size": "1024x1024",
      "idiom": "ios-marketing",
      "filename": "AppIcon-1024x1024@1x.png",
      "scale": "1x"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}

for size, scale, filename in images:
    pixel_size = int(size * scale)
    out_path = os.path.join(TARGET_DIR, filename)
    
    # Use sips to resize
    cmd = ["sips", "-z", str(pixel_size), str(pixel_size), ICON_PATH, "--out", out_path]
    print(f"Generating {filename} ({pixel_size}x{pixel_size})...")
    try:
        subprocess.check_call(cmd)
    except subprocess.CalledProcessError as e:
        print(f"Error generating {filename}: {e}")
        # Dont exit, just try to continue or fail gracefully
        
with open(os.path.join(TARGET_DIR, "Contents.json"), "w") as f:
    json.dump(contents_json, f, indent=2)

print("Icons generated and Contents.json updated.")
