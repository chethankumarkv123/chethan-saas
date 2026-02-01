# Hostinger Deployment Script
# This script builds your application and prepares it for deployment

Write-Host "🚀 Starting Hostinger Deployment Preparation..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean previous build
Write-Host "📦 Step 1: Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "✓ Previous build cleaned" -ForegroundColor Green
} else {
    Write-Host "✓ No previous build found" -ForegroundColor Green
}
Write-Host ""

# Step 2: Build application
Write-Host "🔨 Step 2: Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Copy .htaccess to dist
Write-Host "📄 Step 3: Adding .htaccess file..." -ForegroundColor Yellow
Copy-Item -Path ".htaccess" -Destination "dist\.htaccess" -Force
Write-Host "✓ .htaccess added to dist folder" -ForegroundColor Green
Write-Host ""

# Step 4: Show deployment info
Write-Host "✅ Deployment package ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Build Information:" -ForegroundColor Cyan
Write-Host "   Location: E:\SAAS\dist" -ForegroundColor White
$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   Size: $([math]::Round($distSize, 2)) MB" -ForegroundColor White
$fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
Write-Host "   Files: $fileCount" -ForegroundColor White
Write-Host ""

# Step 5: Show next steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Login to Hostinger hPanel (https://hpanel.hostinger.com)" -ForegroundColor White
Write-Host "   2. Go to Files → File Manager" -ForegroundColor White
Write-Host "   3. Navigate to public_html folder" -ForegroundColor White
Write-Host "   4. Upload ALL files from E:\SAAS\dist folder" -ForegroundColor White
Write-Host "   5. Enable SSL certificate in Security → SSL" -ForegroundColor White
Write-Host "   6. Test your website!" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   - DEPLOY_CHECKLIST.md (Quick guide)" -ForegroundColor White
Write-Host "   - HOSTINGER_DEPLOY.md (Full documentation)" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to deploy!" -ForegroundColor Green
