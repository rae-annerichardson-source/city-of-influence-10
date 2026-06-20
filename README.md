# City of Influence — GitHub Pages Edition

This folder is ready for GitHub Pages as a static HTML, CSS and JavaScript website.

## Important

Upload the **contents of this folder** to the root of your GitHub repository. Do not upload the ZIP itself and do not place these files inside another folder.

The repository root should contain:

- `index.html`
- `styles.css`
- `app.js`
- `content.js`
- the remaining HTML, JavaScript and image files
- `.nojekyll`

## Publish

In GitHub:

1. Open **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main**.
5. Select folder **/(root)**.
6. Click **Save**.

## Why the files are flat

All website assets are stored at the repository root so they can be uploaded through GitHub's browser uploader without needing to upload an `assets` folder.

## Admin portal limitation

`admin.html` works as a browser-based content editor. GitHub Pages is static hosting, so content saved in the portal remains in that browser and does not automatically publish to every visitor. The password gate is client-side and is not server-grade security.


## Scene image compatibility update

The original `scene-master.png` is not required. The homepage now loads the same full desktop scene from the smaller `scene-desktop.webp`, with `scene-desktop-fallback.jpg` as a browser fallback. This is more reliable for GitHub uploads and faster for visitors.
