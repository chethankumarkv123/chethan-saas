# Hostinger Deployment Guide

This guide will help you deploy your React + Vite SaaS application to Hostinger.

## Prerequisites

- Hostinger hosting account (Premium or Business plan recommended for better performance)
- FTP/SFTP credentials from Hostinger
- Domain configured in Hostinger (if using custom domain)

## Deployment Methods

### Method 1: Manual FTP Upload (Recommended for First-Time)

#### Step 1: Build Your Application

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

#### Step 2: Access Hostinger File Manager

1. Log in to your Hostinger control panel (hPanel)
2. Go to **Files** → **File Manager**
3. Navigate to `public_html` folder (or your domain's root folder)

#### Step 3: Upload Files

1. Delete any existing files in `public_html` (backup first if needed)
2. Upload ALL contents from your `dist` folder to `public_html`
   - Upload `index.html`
   - Upload the `assets` folder
   - Upload any other files/folders in `dist`

#### Step 4: Configure .htaccess for React Router

Create a `.htaccess` file in `public_html` with the following content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
</IfModule>
```

---

### Method 2: FTP Client (FileZilla)

#### Step 1: Build Your Application

```bash
npm run build
```

#### Step 2: Get FTP Credentials

1. Log in to Hostinger hPanel
2. Go to **Files** → **FTP Accounts**
3. Note your:
   - FTP Host (usually `ftp.yourdomain.com`)
   - Username
   - Password
   - Port (usually 21)

#### Step 3: Connect via FileZilla

1. Download and install [FileZilla](https://filezilla-project.org/)
2. Open FileZilla
3. Enter your FTP credentials:
   - Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
4. Click **Quickconnect**

#### Step 4: Upload Files

1. Navigate to `public_html` on the remote server (right panel)
2. Navigate to your `dist` folder locally (left panel)
3. Select ALL files and folders in `dist`
4. Right-click → Upload
5. Wait for upload to complete

#### Step 5: Create .htaccess

Upload the `.htaccess` file (see Method 1, Step 4) to `public_html`

---

### Method 3: Git Deployment (Advanced)

#### Step 1: Enable SSH Access

1. Log in to Hostinger hPanel
2. Go to **Advanced** → **SSH Access**
3. Enable SSH and note your credentials

#### Step 2: Connect via SSH

```bash
ssh username@yourdomain.com
```

#### Step 3: Clone Your Repository

```bash
cd public_html
git clone https://github.com/chethankumarkv123/chethan-saas.git .
git checkout dev
```

#### Step 4: Install Dependencies and Build

```bash
# Install Node.js (if not available)
# Hostinger may have Node.js pre-installed, check with: node -v

npm install
npm run build
```

#### Step 5: Move Build Files

```bash
# Move files from dist to public_html root
mv dist/* .
rm -rf dist
```

#### Step 6: Create .htaccess

Create the `.htaccess` file as described in Method 1, Step 4.

---

## Post-Deployment Steps

### 1. Test Your Website

Visit your domain: `https://yourdomain.com`

Check:
- ✅ Homepage loads correctly
- ✅ Navigation works
- ✅ All routes work (no 404 errors)
- ✅ Images and assets load
- ✅ All tools function properly

### 2. Enable HTTPS/SSL

1. Go to Hostinger hPanel
2. Navigate to **Security** → **SSL**
3. Enable SSL certificate (free Let's Encrypt)
4. Force HTTPS redirect

### 3. Configure Domain (if needed)

1. Go to **Domains** in hPanel
2. Point your domain to the correct folder
3. Update DNS if using external domain

### 4. Performance Optimization

Add to your `.htaccess`:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

## Troubleshooting

### Issue: Blank Page After Deployment

**Solution:**
- Check browser console for errors
- Verify all files uploaded correctly
- Check `.htaccess` is present
- Clear browser cache

### Issue: 404 on Page Refresh

**Solution:**
- Ensure `.htaccess` file exists in `public_html`
- Verify mod_rewrite is enabled (contact Hostinger support)

### Issue: Assets Not Loading

**Solution:**
- Check file paths in `index.html`
- Ensure `assets` folder uploaded correctly
- Verify file permissions (644 for files, 755 for folders)

### Issue: Slow Loading

**Solution:**
- Enable GZIP compression (see .htaccess above)
- Enable browser caching
- Optimize images before deployment
- Consider Hostinger CDN

---

## Updating Your Website

### Quick Update Process

1. Make changes locally
2. Run `npm run build`
3. Upload new `dist` contents to `public_html` via FTP
4. Clear browser cache and test

### Automated Updates (Git)

```bash
ssh username@yourdomain.com
cd public_html
git pull origin dev
npm install
npm run build
mv dist/* .
```

---

## Important Notes

- **Always backup** before uploading new files
- **Test locally** before deploying: `npm run preview`
- **Monitor performance** using Hostinger analytics
- **Keep dependencies updated** for security
- **Use environment variables** for sensitive data (create `.env` file)

---

## Support

- **Hostinger Support**: Available 24/7 via live chat
- **Documentation**: https://support.hostinger.com
- **Community**: Hostinger Community Forum

---

## Checklist

Before going live:

- [ ] Build completed successfully (`npm run build`)
- [ ] All files uploaded to `public_html`
- [ ] `.htaccess` file created and configured
- [ ] SSL certificate enabled
- [ ] Domain configured correctly
- [ ] All routes tested
- [ ] All tools tested
- [ ] Performance optimized
- [ ] Security headers added
- [ ] Analytics configured (optional)

---

**Your website should now be live! 🚀**
