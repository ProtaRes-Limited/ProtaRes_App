# ProtaRes Legal Pages — GitHub Pages Setup

## What's Here

- `index.html` — Homepage (landing page for ProtaRes)
- `privacy.html` — Privacy Policy (UK GDPR compliant)
- `terms.html` — Terms of Service

## Deploy to GitHub Pages (5 minutes)

### Step 1: Create the Repository

1. Go to https://github.com/new
2. Repository name: `protares.github.io` (if your GitHub username/org is `protares`)
   - OR use any name like `protares-legal` if you prefer a project page
3. Set to **Public**
4. Click **Create repository**

### Step 2: Push These Files

```bash
cd path/to/this/folder
git init
git add .
git commit -m "Add ProtaRes legal pages"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/protares.github.io.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes

### Step 4: Your URLs

If repo name is `protares.github.io`:
- Homepage: `https://protares.github.io`
- Privacy: `https://protares.github.io/privacy.html`
- Terms: `https://protares.github.io/terms.html`

If repo name is something else (e.g. `protares-legal`):
- Homepage: `https://YOUR_USERNAME.github.io/protares-legal`
- Privacy: `https://YOUR_USERNAME.github.io/protares-legal/privacy.html`
- Terms: `https://YOUR_USERNAME.github.io/protares-legal/terms.html`

### Step 5: Fill in Google Cloud Console

Go to Google Cloud Console → Branding → App domain:

| Field | Value |
|-------|-------|
| Application home page | `https://protares.github.io` |
| Application privacy policy link | `https://protares.github.io/privacy.html` |
| Application Terms of Service link | `https://protares.github.io/terms.html` |

### Optional: Custom Domain

If you own `protares.co.uk` or `protares.com`:

1. In repo Settings → Pages → Custom domain: enter `www.protares.co.uk`
2. Add a CNAME DNS record pointing `www.protares.co.uk` to `YOUR_USERNAME.github.io`
3. Wait for DNS propagation (up to 24 hours)
4. Enable "Enforce HTTPS"

Then update Google Cloud Console with your custom domain URLs instead.
