# 🎯 START HERE - CROWN DEPLOYMENT CHECKLIST

## 📍 **YOU ARE HERE**

✅ Google Drive folder created: `1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU`
✅ Apps Script code ready with your folder ID
✅ Frontend code updated to support Google Drive
✅ Documentation complete

---

## ⚡ **WHAT TO DO NOW** (Choose One)

### **Option A: Quick Deploy (5 minutes)** 🚀
**Best for**: You want to deploy NOW and test immediately

👉 **Follow**: `QUICK_DEPLOY.md`

**Steps**:
1. Verify Drive folder sharing (30 sec)
2. Deploy Apps Script Master (2 min)
3. Update frontend URL (30 sec)
4. Build & deploy (1 min)
5. Test with photo (1 min)

---

### **Option B: Test First (3 minutes)** 🧪
**Best for**: You want to verify everything works before deploying

👉 **Follow**: `TEST_GDRIVE_CONNECTION.gs`

**Steps**:
1. Open Apps Script editor
2. Create new file
3. Paste `TEST_GDRIVE_CONNECTION.gs` code
4. Run `testDriveConnection()`
5. Check log output
6. If ✅ → Go to Option A

---

### **Option C: Read Documentation (10 minutes)** 📚
**Best for**: You want to understand the full setup first

👉 **Read**:
1. `DEPLOYMENT_SUMMARY.md` - Overview
2. `SETUP_GOOGLE_DRIVE_LENGKAP.md` - Complete guide
3. Then go to Option A or B

---

## 🎯 **RECOMMENDED PATH**

```
1. Quick Test (2 min)
   └─ Run TEST_GDRIVE_CONNECTION.gs
   └─ Verify folder accessible
   └─ Test upload works
        │
        ├─ ✅ Success → Continue to Step 2
        └─ ❌ Failed → Fix folder sharing, retry
             
2. Deploy Apps Script (2 min)
   └─ Open master spreadsheet
   └─ Extensions → Apps Script
   └─ Paste APPS_SCRIPT_MASTER_FINAL.gs
   └─ Run setupSubmissionsHeader()
   └─ Deploy as Web App
   └─ Copy deployment URL
   
3. Update Frontend (1 min)
   └─ Edit src/app/utils/api.ts line 57
   └─ Paste deployment URL
   └─ Save
   
4. Test Submit (2 min)
   └─ Build frontend (pnpm run build)
   └─ Run app
   └─ Register master branch
   └─ Submit with photo
   └─ Verify photo in Drive & Sheets
   
5. Done! ✅
```

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

Before you start, verify these:

### **Google Drive**
- [ ] Folder created: https://drive.google.com/drive/folders/1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU
- [ ] Folder sharing: "Anyone with the link" (Viewer)
- [ ] Folder ID extracted: `1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU`

### **Google Spreadsheet**
- [ ] Master spreadsheet exists: `1pPxEAmBzR4vq3AiXyEQ4JqMe3pT4KyenLLiosuF-aU0`
- [ ] Has sheets: `branches`, `submissions`, `settings`, `indicators`
- [ ] You have Editor access

### **Code Files**
- [ ] `APPS_SCRIPT_MASTER_FINAL.gs` exists
- [ ] Contains correct MASTER_SPREADSHEET_ID (line 24)
- [ ] Contains correct MASTER_GDRIVE_FOLDER_ID (line 25)
- [ ] Frontend updated (if you edited manually)

---

## 🚦 **DEPLOYMENT STATUS**

Track your progress:

```
[ ] 1. Test Drive connection (TEST_GDRIVE_CONNECTION.gs)
[ ] 2. Deploy Apps Script Master
[ ] 3. Update frontend APPS_SCRIPT_URL
[ ] 4. Build frontend
[ ] 5. Register master branch in app
[ ] 6. Test submit with photo
[ ] 7. Verify photo in Drive
[ ] 8. Verify photo in Sheets
[ ] 9. Test export Excel
[ ] 10. Production ready! 🎉
```

---

## 📞 **NEED HELP?**

### **If Drive folder test fails**:
→ Check `QUICK_DEPLOY.md` → Troubleshooting section
→ Run `testDriveConnection()` for detailed error

### **If Apps Script deployment fails**:
→ Check permissions (Extensions → Apps Script → Review permissions)
→ Make sure you're signed in to correct Google account
→ Verify MASTER_SPREADSHEET_ID matches your spreadsheet

### **If photo upload fails**:
→ Check browser console (F12) for errors
→ Check Apps Script execution log
→ Verify gdriveFolderId passed to API

### **Can't find a file?**:
All files are in project root:
```
/workspaces/default/code/
├── APPS_SCRIPT_MASTER_FINAL.gs
├── APPS_SCRIPT_BRANCH_TEMPLATE.gs
├── TEST_GDRIVE_CONNECTION.gs
├── QUICK_DEPLOY.md
├── SETUP_GOOGLE_DRIVE_LENGKAP.md
├── DEPLOYMENT_SUMMARY.md
└── START_HERE.md (this file)
```

---

## 💡 **PRO TIPS**

1. **Test First**: Always run `TEST_GDRIVE_CONNECTION.gs` before production
2. **Keep URLs**: Save all deployment URLs in a text file for reference
3. **Browser Console**: Keep F12 console open during testing
4. **Apps Script Log**: Check execution log after each submit
5. **Folder Naming**: Use clear names like "Foto Toko [Branch]" for easy management

---

## ✨ **READY TO START?**

Pick your path:

1. 🚀 **I want to deploy NOW** → `QUICK_DEPLOY.md`
2. 🧪 **I want to test first** → Run `TEST_GDRIVE_CONNECTION.gs`
3. 📚 **I want to read more** → `SETUP_GOOGLE_DRIVE_LENGKAP.md`

---

## 🎉 **YOU'VE GOT THIS!**

Everything is configured and ready to go.

**Your Google Drive Folder ID**: `1RjScSYlsqKMRmbv-Bk6bHLJyV9rM0NLU`

Just follow the steps in `QUICK_DEPLOY.md` and you'll be up and running in 5 minutes!

Good luck! 🚀
