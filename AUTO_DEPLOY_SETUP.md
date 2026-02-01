# 🚀 Automatic Deployment Setup Guide

## ✨ What This Does

Once configured, **every time you push code to the `dev` branch**, GitHub will automatically:

1. ✅ Build your application
2. ✅ Optimize and minify files
3. ✅ Upload to Hostinger
4. ✅ Update your live website

**No manual upload needed!** 🎉

---

## 📋 Setup Steps (One-Time Only)

### Step 1: Get Your Hostinger FTP Credentials

1. **Login to Hostinger hPanel**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Navigate to FTP Accounts**
   - Click **Files** → **FTP Accounts**

3. **Note Down These Details:**
   ```
   FTP Server:   ftp.yourdomain.com (or IP address)
   FTP Username: your-ftp-username
   FTP Password: your-ftp-password
   FTP Port:     21 (default)
   ```

   **Example:**
   ```
   FTP Server:   ftp.example.com
   FTP Username: u123456789
   FTP Password: YourSecurePassword123!
   ```

---

### Step 2: Add FTP Credentials to GitHub Secrets

1. **Go to Your GitHub Repository**
   - Visit: https://github.com/chethankumarkv123/chethan-saas

2. **Open Settings**
   - Click **Settings** tab (top right)

3. **Navigate to Secrets**
   - Click **Secrets and variables** → **Actions** (left sidebar)

4. **Add New Secrets** (Click "New repository secret" for each)

   **Secret 1: FTP_SERVER**
   - Name: `FTP_SERVER`
   - Value: `ftp.yourdomain.com` (your FTP server)
   - Click **Add secret**

   **Secret 2: FTP_USERNAME**
   - Name: `FTP_USERNAME`
   - Value: `your-ftp-username` (your FTP username)
   - Click **Add secret**

   **Secret 3: FTP_PASSWORD**
   - Name: `FTP_PASSWORD`
   - Value: `your-ftp-password` (your FTP password)
   - Click **Add secret**

5. **Verify Secrets Added**
   - You should see 3 secrets listed:
     - `FTP_SERVER`
     - `FTP_USERNAME`
     - `FTP_PASSWORD`

---

### Step 3: Push the Workflow to GitHub

The workflow file has been created at `.github/workflows/deploy.yml`

Now push it to GitHub:

```powershell
# Add the workflow file
git add .github/workflows/deploy.yml

# Commit the workflow
git commit -m "Add automatic deployment workflow"

# Push to dev branch
git push origin dev
```

**This first push will trigger the deployment!** 🚀

---

### Step 4: Monitor the Deployment

1. **Go to GitHub Actions**
   - Visit: https://github.com/chethankumarkv123/chethan-saas/actions

2. **Watch the Deployment**
   - You'll see a workflow run called "Deploy to Hostinger"
   - Click on it to see real-time progress
   - Each step will show:
     - 📥 Checkout code
     - 🔧 Setup Node.js
     - 📦 Install dependencies
     - 🔨 Build application
     - 📄 Add .htaccess
     - 🚀 Deploy to Hostinger
     - ✅ Deployment complete

3. **Deployment Time**
   - First deployment: ~3-5 minutes
   - Subsequent deployments: ~2-3 minutes

4. **Check Your Website**
   - Visit your domain: `https://yourdomain.com`
   - Your changes should be live! 🎉

---

## 🔄 How to Use (Daily Workflow)

From now on, your workflow is **super simple**:

```powershell
# 1. Make changes to your code
# Edit files in E:\SAAS\src\...

# 2. Test locally (optional but recommended)
npm run dev
# Visit http://localhost:5173

# 3. Commit and push to Git
git add .
git commit -m "Description of your changes"
git push origin dev

# 4. That's it! 🎉
# GitHub automatically builds and deploys to Hostinger
# Check progress at: https://github.com/chethankumarkv123/chethan-saas/actions
```

**Your website updates automatically in 2-3 minutes!** ⚡

---

## 📊 Deployment Flow Diagram

```
Local Changes (E:\SAAS)
        ↓
   git add .
   git commit -m "message"
   git push origin dev
        ↓
GitHub receives push
        ↓
GitHub Actions triggers
        ↓
    Builds app (npm run build)
        ↓
    Uploads to Hostinger (FTP)
        ↓
Live Website Updated! 🎉
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] FTP credentials added to GitHub Secrets
- [ ] Workflow file pushed to GitHub
- [ ] First deployment completed successfully
- [ ] Website accessible at your domain
- [ ] All pages and tools working
- [ ] No console errors

---

## 🔍 Monitoring Deployments

### View Deployment Status

1. **GitHub Actions Page**
   - https://github.com/chethankumarkv123/chethan-saas/actions
   - Shows all deployments (success/failure)

2. **Deployment Badges** (Optional)
   - Add to your README.md:
   ```markdown
   ![Deploy Status](https://github.com/chethankumarkv123/chethan-saas/actions/workflows/deploy.yml/badge.svg)
   ```

### Email Notifications

GitHub automatically sends email notifications for:
- ✅ Successful deployments
- ❌ Failed deployments

---

## 🐛 Troubleshooting

### Issue: Deployment Fails at FTP Step

**Possible Causes:**
- Incorrect FTP credentials
- FTP server down
- Network issues

**Solution:**
1. Verify FTP credentials in Hostinger
2. Update GitHub Secrets if needed
3. Check Hostinger server status
4. Re-run the workflow

### Issue: Build Fails

**Possible Causes:**
- Syntax errors in code
- Missing dependencies
- Build errors

**Solution:**
1. Check the error in GitHub Actions logs
2. Fix the error locally
3. Test with `npm run build` locally
4. Push the fix

### Issue: Website Not Updating

**Possible Causes:**
- Browser cache
- Deployment didn't complete
- Wrong server directory

**Solution:**
1. Check GitHub Actions - deployment successful?
2. Clear browser cache (Ctrl + Shift + R)
3. Verify `server-dir` in workflow is correct
4. Check Hostinger File Manager

### Issue: 404 Errors on Routes

**Possible Causes:**
- `.htaccess` not uploaded
- `.htaccess` in wrong location

**Solution:**
1. Verify `.htaccess` exists in `public_html`
2. Check workflow includes `.htaccess` copy step
3. Re-deploy

---

## ⚙️ Advanced Configuration

### Deploy Only on Specific Commits

Edit `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - dev
    paths-ignore:
      - 'README.md'
      - 'docs/**'
```

### Deploy to Multiple Environments

Create separate workflows:
- `deploy-dev.yml` - Deploys to dev server
- `deploy-prod.yml` - Deploys to production (on push to `main`)

### Add Slack/Discord Notifications

Add notification step to workflow:

```yaml
- name: 📢 Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Use GitHub Secrets for credentials
- Use strong FTP passwords
- Enable 2FA on GitHub
- Regularly update dependencies
- Review deployment logs

❌ **DON'T:**
- Commit FTP credentials to code
- Share GitHub Secrets
- Use weak passwords
- Ignore failed deployments
- Deploy without testing

---

## 📈 Benefits of Automatic Deployment

| Before (Manual) | After (Automatic) |
|----------------|-------------------|
| 10-15 minutes per deploy | 2-3 minutes per deploy |
| Manual build + upload | Automatic build + upload |
| Risk of forgetting steps | Consistent every time |
| Deploy from computer only | Deploy from anywhere |
| Manual error-prone | Automated & reliable |

---

## 🎯 Quick Reference

### Deploy Your Changes
```powershell
git add .
git commit -m "Your changes"
git push origin dev
```

### View Deployment Status
```
https://github.com/chethankumarkv123/chethan-saas/actions
```

### FTP Credentials Location
```
Hostinger hPanel → Files → FTP Accounts
```

### GitHub Secrets Location
```
GitHub Repo → Settings → Secrets and variables → Actions
```

---

## 📞 Support

### GitHub Actions Issues
- **Documentation:** https://docs.github.com/en/actions
- **Community:** https://github.community

### Hostinger FTP Issues
- **Support:** 24/7 Live Chat in hPanel
- **Docs:** https://support.hostinger.com

---

## 🎉 You're All Set!

Once you complete the setup steps above, you'll have:

✅ Automatic deployment on every push to `dev`
✅ No manual build or upload needed
✅ Deployment status tracking
✅ Email notifications
✅ Consistent, reliable deployments

**Your new workflow:**
1. Write code
2. Push to Git
3. Website updates automatically! 🚀

---

## 📝 Next Steps

1. ✅ Get FTP credentials from Hostinger
2. ✅ Add credentials to GitHub Secrets
3. ✅ Push workflow to GitHub
4. ✅ Watch first deployment
5. ✅ Test your website
6. ✅ Enjoy automatic deployments! 🎉

**Need help? Check the troubleshooting section or contact support.**
