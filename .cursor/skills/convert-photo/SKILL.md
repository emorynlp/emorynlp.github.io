---
name: convert-photo
description: >-
  Converts a JPG/PNG photo to WebP and resizes it to a maximum of 1920px on the
  longest side. Use when the user provides a photo file (jpg, jpeg, png) that
  needs to be converted to WebP, resized, or optimized for web use in
  news, papers, or theses under public/.
---

# Convert a photo to WebP (max 1920px)

## Steps

1. **Identify the file** the user provided (path or filename).

2. **Run the resize/convert script:**

   ```bash
   node scripts/resize-media-photo.mjs {filepath}
   ```

   Behavior by file type:
   - **`.jpg` / `.jpeg` / `.png`** — resizes to ≤1920px with `sips` (if needed), converts to `.webp` with `cwebp`, deletes the original.
   - **`.webp`** — resizes in-place via `dwebp → sips → cwebp` (if needed); already-small files are left as-is.

   The output is always **`{same-stem}.webp`** in the same directory as the input.

   Requires `cwebp`/`dwebp` (`brew install webp`).

3. **Confirm the output** — report the new filename and dimensions to the user.

## Notes

- For **people photos** (max 600px instead of 1920px), use `node scripts/resize-people-photo.mjs` instead.
- Do not move the output to a different directory unless the user explicitly asks.
