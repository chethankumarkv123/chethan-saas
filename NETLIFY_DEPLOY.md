# Netlify Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Deploy via Netlify CLI (Fastest)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   # Build your site
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod
   ```

---

### Option 2: Deploy via Git (Continuous Deployment)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider
   - Select your repository
   - Netlify will auto-detect settings from `netlify.toml`
   - Click "Deploy site"

---

### Option 3: Drag & Drop (Easiest)

1. **Build your site**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to https://app.netlify.com/drop
   - Drag the `dist` folder to the upload area
   - Done! Your site is live

---

## Configuration Details

Your site is already configured with:

✅ **Build Command**: `npm run build`  
✅ **Publish Directory**: `dist`  
✅ **SPA Routing**: Configured (all routes redirect to index.html)  
✅ **Security Headers**: X-Frame-Options, CSP, etc.  
✅ **Asset Caching**: 1 year cache for static files  
✅ **Node Version**: Auto-detected from package.json

---

## Custom Domain (Optional)

After deployment:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

---

## Environment Variables

If you need environment variables:
1. Go to Site settings → Environment variables
2. Add your variables
3. Redeploy

---

## Build Optimization Tips

Your site is already optimized, but you can:
- Enable Netlify's **Asset Optimization** (minify CSS/JS)
- Enable **Image Optimization** (automatic WebP conversion)
- Use **Netlify Analytics** for visitor insights

---

## Troubleshooting

**Build fails?**
- Check Node version (should be 18+)
- Run `npm install` locally first
- Check build logs in Netlify dashboard

**Routes not working?**
- Ensure `netlify.toml` is in the root directory
- Check the redirects configuration

**Slow builds?**
- Enable build cache in Netlify settings
- Consider using Netlify's build plugins

---

## Cost

- **Free Tier**: 100GB bandwidth/month, 300 build minutes/month
- Perfect for your use case (static site with client-side processing)
- No backend = No server costs!

---

## Next Steps

1. Deploy using one of the methods above
2. Test your live site
3. Set up custom domain (optional)
4. Enable HTTPS (automatic with Netlify)
5. Share your site! 🚀
