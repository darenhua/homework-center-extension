# Asul Font Files

This directory is for local Asul font files. Currently, the extension uses Google Fonts as a fallback.

## Current Setup

✅ **Google Fonts Fallback**: The extension currently loads Asul from Google Fonts via CSS import in `src/style.css`

## To Use Local Font Files (Optional)

Place the following Asul font files in this directory:

1. `Asul-Regular.ttf` - Regular weight (400)
2. `Asul-Bold.ttf` - Bold weight (700)

### Font Sources

Download the Asul font from:
- Google Fonts: https://fonts.google.com/specimen/Asul
- Direct download: https://fonts.google.com/download?family=Asul

### Installation Steps

1. Download the font files from Google Fonts
2. Extract the files
3. Place `Asul-Regular.ttf` and `Asul-Bold.ttf` in this directory
4. In `src/style.css`, comment out the Google Fonts import:
   ```css
   /* @import url("https://fonts.googleapis.com/css2?family=Asul:wght@400;700&display=swap"); */
   ```
5. Uncomment the local @font-face declarations in `src/style.css`
6. Update the font file paths if needed
7. Rebuild the extension with `pnpm build`

## Tailwind Classes Available

- `plasmo-font-asul` - Uses the Asul font family
- `plasmo-font-asul-regular` - Uses Asul with 400 weight  
- `plasmo-font-asul-bold` - Uses Asul with 700 weight

## Benefits of Local Fonts

- ✅ Faster loading (no external requests)
- ✅ Works offline
- ✅ Better privacy (no Google Fonts tracking)
- ✅ Consistent loading across all environments