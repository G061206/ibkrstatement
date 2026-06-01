# Quick Start Guide: Using the Translation System

## For Users

### Changing Language
1. Look for language buttons in the top navigation bar
2. Click **"EN"** for English
3. Click **"中"** for Chinese (Simplified)
4. Your preference is automatically saved

### First Visit
- Website defaults to **English**
- Switch to Chinese anytime with the language button
- Language choice persists when you reload the page

---

## For Developers

### Adding New Text to the UI

#### Problem
You want to add a button that says "Export Data"

#### Solution

**Step 1:** Open `src/translations.js`

**Step 2:** Find the `en:` object and add:
```javascript
en: {
  exportData: "Export Data",
  // ... other keys
}
```

**Step 3:** Find the `zh:` object and add:
```javascript
zh: {
  exportData: "导出数据",
  // ... other keys
}
```

**Step 4:** In your code (`src/app.js`), use:
```javascript
<button>${t("exportData")}</button>
```

**Done!** The button will automatically display:
- "Export Data" when language is English
- "导出数据" when language is Chinese

---

### Key Rules to Remember

✅ **DO:**
- Always use `t(key)` for display text
- Add translations for BOTH English and Chinese
- Use lowercase camelCase for translation keys
- Check [TRANSLATIONS.md](TRANSLATIONS.md) for guidelines

❌ **DON'T:**
- Hardcode text like `<button>Export Data</button>`
- Add translations for only one language
- Use spaces or special characters in keys
- Forget to update both `en:` and `zh:` objects

---

### Translation Key Naming Convention

```javascript
// ✅ GOOD - Clear, concise, camelCase
uploadTitle
downloadFile
errorMessage

// ❌ BAD - Unclear or wrong format
upload_title
downloadfile
upload-title
error_message_text
```

---

### Most Common Translation Keys

```javascript
// Navigation
tabOverview        // "Overview" / "总览"
tabPositions       // "Positions" / "持仓"
tabPerformance     // "Performance" / "收益"
tabDaily           // "PnL" / "盈亏"
tabData            // "Data" / "数据"

// Buttons
chooseFile         // "Choose file" / "选择文件"
uploadFile         // "Upload" / "上传"
exportJson         // "Export JSON" / "导出 JSON"
close              // "Close" / "关闭"

// Status
account            // "Account" / "账户"
baseCurrency       // "Base currency" / "基础货币"
stocks             // "Stocks" / "股票"
```

---

### How the Translation System Works

```
User sees UI
    ↓
UI calls t("someKey")
    ↓
System checks: What language is user using?
    ↓
If English: Return translations.en["someKey"]
If Chinese: Return translations.zh["someKey"]
    ↓
Display translated text
```

---

### Testing Your Changes

After adding new translation keys:

1. **Test in English:**
   - Open website
   - Make sure it's set to English (click "EN" button)
   - Reload page
   - Verify new text appears in English

2. **Test in Chinese:**
   - Click "中" button to switch to Chinese
   - Verify new text appears in Chinese
   - Reload page to ensure it persists

3. **Test persistence:**
   - In Chinese mode, close and reopen the website
   - Should still be in Chinese
   - Reload page multiple times
   - Language should persist

---

### Adding a New Language (e.g., Japanese)

1. Open `src/translations.js`

2. Add Japanese object:
```javascript
export const translations = {
  en: { ... },
  zh: { ... },
  ja: {  // ← NEW
    uploadTitle: "アップロード",
    chooseFile: "ファイルを選択",
    // ... all other keys in Japanese
  }
};
```

3. Add button to UI (in `src/app.js`):
```javascript
<button class="language-option" data-language="ja">日本語</button>
```

4. Done! Language switching will automatically work

---

### Troubleshooting

**Problem:** Text doesn't show up in my language
- **Solution:** Check `src/translations.js` - the key might be missing or misspelled

**Problem:** Translation key appears as literal text
- **Solution:** The key might not exist in the current language. Check translations.js

**Problem:** Language doesn't persist after reload
- **Solution:** Check browser's localStorage is enabled, and language code is correct

---

### Files You'll Need

| File | Purpose |
|------|---------|
| `src/translations.js` | Edit to add/update translations |
| `src/app.js` | Edit to use `t(key)` in templates |
| `TRANSLATIONS.md` | Read for detailed guidelines |

---

### Quick Reference

```javascript
// How to use translations
function t(key) {
  return translations[state.language]?.[key] || translations.en[key] || key;
}

// Example usage in HTML template
`<h1>${t("uploadTitle")}</h1>`
// Returns: "Upload Activity Statement" (English)
// Returns: "上传活动报表" (Chinese)
```

---

### Need More Help?

- **Understanding the system?** → Read [ARCHITECTURE.md](ARCHITECTURE.md)
- **Setting up translations?** → Read [TRANSLATIONS.md](TRANSLATIONS.md)
- **What changed?** → Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Checking your work?** → Use [I18N_CHECKLIST.md](I18N_CHECKLIST.md)

---

## Summary

✅ Website defaults to English  
✅ Users can switch languages anytime  
✅ All text is translateable  
✅ Easy to add new languages  
✅ Documentation included  

**Start by editing `src/translations.js` to add your new text!**
