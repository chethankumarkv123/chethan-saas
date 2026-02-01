# ⚡ Auto-Deploy Quick Start

## 🎯 What You Get

**Push to Git → Website Updates Automatically!** 🚀

```
Your Code Changes → Git Push → Auto Build → Auto Upload → Live Website ✨
```

---

## 🚀 3-Step Setup (One Time Only)

### Step 1: Get FTP Credentials from Hostinger

1. Login: https://hpanel.hostinger.com
2. Go to: **Files** → **FTP Accounts**
3. Copy these 3 values:
   - FTP Server (e.g., `ftp.yourdomain.com`)
   - FTP Username (e.g., `u123456789`)
   - FTP Password

### Step 2: Add to GitHub Secrets

1. Go to: https://github.com/chethankumarkv123/chethan-saas/settings/secrets/actions
2. Click **New repository secret** (3 times for each):

   | Name | Value |
   |------|-------|
   | `FTP_SERVER` | Your FTP server |
   | `FTP_USERNAME` | Your FTP username |
   | `FTP_PASSWORD` | Your FTP password |

### Step 3: Push Workflow to GitHub

```powershell
git add .github/workflows/deploy.yml
git commit -m "Add auto-deployment"
git push origin dev
```

**Done! Your first deployment will start automatically!** 🎉

---

## 💻 Your New Daily Workflow

```powershell
# 1. Make changes to your code
# (Edit any files in E:\SAAS\src\...)

# 2. Commit and push
git add .
git commit -m "Your changes description"
git push origin dev

# 3. That's it! ✨
# Website updates automatically in 2-3 minutes
```

---

## 📊 Monitor Deployments

**View Status:**
https://github.com/chethankumarkv123/chethan-saas/actions

**You'll see:**
- ✅ Green checkmark = Deployed successfully
- 🔄 Yellow circle = Deploying now
- ❌ Red X = Deployment failed (check logs)

---

## 🎯 What Happens Automatically

Every time you push to `dev` branch:

1. ✅ **GitHub Actions starts** (within seconds)
2. ✅ **Installs dependencies** (~30 seconds)
3. ✅ **Builds your app** (`npm run build` - ~10 seconds)
4. ✅ **Adds .htaccess** (for React Router)
5. ✅ **Uploads to Hostinger** via FTP (~1-2 minutes)
6. ✅ **Website is live!** 🎉

**Total Time:** 2-3 minutes from push to live!

---

## 🔍 Quick Troubleshooting

### Deployment Failed?

1. **Check GitHub Actions logs:**
   - https://github.com/chethankumarkv123/chethan-saas/actions
   - Click on the failed run
   - Check which step failed

2. **Common Issues:**
   - ❌ **FTP credentials wrong** → Update GitHub Secrets
   - ❌ **Build error** → Fix code error, test locally with `npm run build`
   - ❌ **Network issue** → Re-run the workflow

### Website Not Updating?

1. **Clear browser cache:** Ctrl + Shift + R
2. **Check deployment status:** Should show green ✅
3. **Wait 2-3 minutes** after push

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow |
| `AUTO_DEPLOY_SETUP.md` | Full setup guide |
| `AUTO_DEPLOY_QUICK.md` | This quick reference |

---

## ✅ Verification Checklist

After setup:

- [ ] FTP credentials added to GitHub Secrets (3 secrets)
- [ ] Workflow file pushed to GitHub
- [ ] First deployment completed (check Actions page)
- [ ] Website accessible and updated
- [ ] All tools working correctly

---

## 🎉 Benefits

| Before | After |
|--------|-------|
| Manual build + upload | Automatic |
| 10-15 minutes | 2-3 minutes |
| Error-prone | Reliable |
| Deploy from computer only | Deploy from anywhere |

---

## 📞 Need Help?

- **Full Guide:** Read `AUTO_DEPLOY_SETUP.md`
- **GitHub Actions:** https://github.com/chethankumarkv123/chethan-saas/actions
- **Hostinger Support:** 24/7 Live Chat

---

## 🚀 You're Ready!

**Your new workflow is:**
1. Write code
2. `git push origin dev`
3. ☕ Wait 2-3 minutes
4. Website is updated! ✨

**No more manual uploads!** 🎉
