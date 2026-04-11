# Assets

This directory must contain production-quality brand assets before running `npx expo prebuild` or submitting to the stores. See [`../../CLAUDE_CODE_MASTER_INSTRUCTIONS.md`](../../CLAUDE_CODE_MASTER_INSTRUCTIONS.md) §7 for the full spec.

## Required files

| File | Size | Purpose |
| --- | --- | --- |
| `icon.png` | 1024×1024 | App icon (iOS App Store, home screen) |
| `adaptive-icon-foreground.png` | 1024×1024 | Android adaptive icon foreground layer (with safe zone) |
| `splash-icon.png` | 512×512+ | Launch splash image over the NHS Blue background |
| `notification-icon.png` | 96×96 | Android notification icon (white on transparent) |
| `sounds/emergency_alert.wav` | — | Custom emergency notification sound |

## Brand guidance

- **Background colour:** NHS Blue `#005EB8`
- **Mark:** White ProtaRes symbol (suggested: location pin merged with a medical cross / pulse line)
- **No text in the icon** — text is illegible at small sizes
- iOS: no transparency (rounded corners handled by OS)
- Android: follow adaptive icon guidelines (foreground + background layers)

## Generation

Use a vector tool (Figma / Illustrator) to produce the master, then export at the required sizes. Do NOT use AI-generated icons without review — they often include subtle text artifacts or trademarked shapes.

## What happens without these assets

- Expo will use its default template icon and splash image
- `npx expo prebuild` will **fail** if `app.config.ts` references files that do not exist
- To scaffold without assets, comment out the icon / splash / adaptive-icon keys in `app.config.ts` and uncomment them once the files are in place.
