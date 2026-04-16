# UDDI Permission Scope Helper

A static micro site that helps Infoblox Universal DDI customers generate least-privilege IAM permission policies for AWS, Azure, and GCP cloud integrations. Customers select which discovery and management features they need, and the site outputs ready-to-use IAM policies, Terraform snippets, and step-by-step setup instructions — enabling security-team-approved policies in under 2 minutes.

## Features

- Wizard mode for guided feature selection
- Advanced mode with direct checkboxes
- Three output formats: native policy, Terraform HCL, step-by-step guide
- AWS policy size warning when approaching IAM managed policy limits
- Copy to clipboard and file download
- Works offline after first visit
- No build step, no dependencies, pure HTML/CSS/JS

## Quick Start

```bash
# Clone and open
git clone <repo-url>
cd uddi-permission
open index.html

# Or use any local HTTP server:
python3 -m http.server 8000
```

## Deployment

### GitHub Pages

1. Push to a GitHub repository
2. Go to Settings > Pages
3. Set Source to "Deploy from a branch", select `main` branch and `/ (root)` folder
4. Site will be available at `https://<username>.github.io/<repo-name>/`

### Netlify

1. Connect the repository in Netlify dashboard
2. Build command: (leave blank — no build step)
3. Publish directory: `.` (root)
4. Deploy

### Any Static Host

- Upload all files preserving directory structure
- No build step required
- All paths are relative — works from any URL path
- Prism.js syntax highlighting loaded from CDN; all other assets are local

## Offline Support

- All CSS, JS, and image assets are bundled locally
- Prism.js is loaded from CDN for syntax highlighting; if unavailable (offline), output renders as plain unformatted text
- After one visit on a normal connection, browser caching enables offline use

## Project Structure

```
index.html          - Single-page application
css/styles.css      - All styles (CSS custom properties, no preprocessor)
js/app.js           - Entry point, event wiring
js/state.js         - Application state management
js/ui.js            - DOM rendering (wizard + advanced modes)
js/questions.js     - Question engine for wizard mode
js/output.js        - Output rendering, policy size checks
js/data/aws.js      - AWS permission data and generators
js/data/azure.js    - Azure permission data and generators
js/data/gcp.js      - GCP permission data and generators
assets/             - Logo and static assets
```

## License

Not an official Infoblox product. Based on Infoblox Universal DDI documentation.
