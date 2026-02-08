#!/bin/bash
ICON="app-icon.png"
DEST="ios/App/App/Assets.xcassets/Splash.imageset"

# Resize to 512x512 first (logo size)
sips -Z 512 "$ICON" --out "logo-512.png"

# Create a white background 2732x2732 (sips hack: resize a small white pixel up? No, sips pad can do it)
# We will pad the 512 logo to 2732x2732 with white background
sips -p 2732 2732 --padColor FFFFFF "logo-512.png" --out "$DEST/splash-2732x2732.png"
cp "$DEST/splash-2732x2732.png" "$DEST/splash-2732x2732-1.png"
cp "$DEST/splash-2732x2732.png" "$DEST/splash-2732x2732-2.png"

rm "logo-512.png"
echo "Splash screens generated."
