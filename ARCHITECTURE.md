# Architecture Overview: IBKR Analytics Studio i18n

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    IBKR Analytics Studio                         │
│                    (User Interface)                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      src/app.js                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  // Get translated text                                 │   │
│  │  function t(key) {                                       │   │
│  │    return translations[state.language]?.[key] ||         │   │
│  │           translations.en[key] || key;                  │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  Usage: ${t("uploadTitle")}  →  "Upload Activity Statement"     │
│         (English default)    →  "上传活动报表" (if Chinese)     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   src/translations.js                            │
│                  (Translation Dictionary)                        │
│                                                                  │
│  export const translations = {                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ en: {  // English (Default Language)                    │   │
│  │   activityStatement: "Activity Statement",              │   │
│  │   uploadTitle: "Upload Activity Statement",             │   │
│  │   ... (60+ more keys)                                   │   │
│  │ }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ zh: {  // Chinese (Simplified)                          │   │
│  │   activityStatement: "Activity Statement",              │   │
│  │   uploadTitle: "上传活动报表",                          │   │
│  │   ... (60+ more keys)                                   │   │
│  │ }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Page Load
```
Browser loads page
    ↓
state.language = localStorage.getItem("ibkr-analytics-language") || "en"
    ↓
state.language = "en" (if first visit or not set)
    ↓
applyLanguage() sets HTML lang="en"
    ↓
render() displays UI in English
```

### 2. User Switches Language
```
User clicks "中" button (Chinese)
    ↓
state.language = "zh"
    ↓
localStorage.setItem("ibkr-analytics-language", "zh")
    ↓
applyLanguage() sets HTML lang="zh-CN"
    ↓
render() re-displays all UI using Chinese translations
    ↓
User clicks "EN" button
    ↓
... (repeats with "en")
```

### 3. Text Retrieval
```
Template calls t("uploadTitle")
    ↓
t() function checks:
    1. translations["en"]["uploadTitle"] → "Upload Activity Statement"
    OR
    1. translations["zh"]["uploadTitle"] → "上传活动报表"
    2. If missing, translations["en"]["uploadTitle"] (fallback)
    3. If still missing, return key as-is
    ↓
Display translated text
```

## File Organization

```
ibkrstatement/
├── src/
│   ├── app.js                    ← Main app (uses translations)
│   ├── translations.js           ← NEW: Translation dictionary
│   ├── encoding.js
│   ├── parser.js
│   └── reportLanguage.js
├── TRANSLATIONS.md               ← NEW: Developer guide
├── IMPLEMENTATION_SUMMARY.md     ← NEW: What changed
├── I18N_CHECKLIST.md            ← NEW: Verification checklist
└── ... (other files)
```

## Translation Workflow

### Adding New UI Text

```
Step 1: Identify new text
┌────────────────────────┐
│ "Share this report"    │
└────────────────────────┘
    ↓
Step 2: Create translation key
┌────────────────────────┐
│ shareThisReport        │
└────────────────────────┘
    ↓
Step 3: Add to translations.js
┌──────────────────────────────────┐
│ en: {                            │
│   shareThisReport: "Share th..." │
│ },                               │
│ zh: {                            │
│   shareThisReport: "分享此报告" │
│ }                                │
└──────────────────────────────────┘
    ↓
Step 4: Use in app.js
┌──────────────────────────┐
│ ${t("shareThisReport")}  │
└──────────────────────────┘
    ↓
Done! ✓
```

## Language State Management

```
┌─────────────────────────────────────┐
│  state object (app.js)              │
├─────────────────────────────────────┤
│ language: "en"  // or "zh"          │
│                                     │
│ // Persisted to localStorage:       │
│ // "ibkr-analytics-language"        │
└─────────────────────────────────────┘
```

## Fallback Chain

```
When translating text:

  t("someKey")
      ↓
   Check: translations[state.language]["someKey"]
      ↓
   Found? ✓ Return translation
      ✗ Continue...
      ↓
   Check: translations.en["someKey"]
      ↓
   Found? ✓ Return English (fallback)
      ✗ Continue...
      ↓
   Return: key (literal key as last resort)
```

## Translation Coverage (66 Keys)

```
Navigation Strings (6)
├── tabOverview
├── tabPositions
├── tabPerformance
├── tabDaily
└── tabData

Upload Section (14)
├── uploadTitle
├── uploadIntro
├── privacyLabel
├── localOnly
├── privacyBody
├── dropTitle
├── dropBody
├── chooseFile
├── loadSample
├── pasteCsv
├── parseText
└── ... (more)

Export Guide (5)
├── guideStep1
├── guideStep2
├── guideStep3
├── guideStep4
└── guideStep5

Data Labels (12)
├── account
├── baseCurrency
├── stocks
├── options
├── forex
└── ... (more)

And 29 more keys...
```

## Supported Languages

| Code | Name | Status | Default |
|------|------|--------|---------|
| `en` | English | ✓ Supported | **YES** |
| `zh` | 中文 (Chinese) | ✓ Supported | No |

To add new language (e.g., Japanese):
1. Add language code + translations to `translations.js`
2. Add language button to UI
3. Done!

## Performance Notes

- ✓ Zero runtime overhead (lookups are O(1))
- ✓ Single file for all translations (efficient)
- ✓ No external i18n library required
- ✓ localStorage used for persistence (fast)
- ✓ Fallback system prevents missing translations

## Browser Compatibility

- ✓ Chrome/Edge (Optional chaining `?.` support)
- ✓ Firefox
- ✓ Safari 13.1+
- ✓ localStorage API support required

## Accessibility

- ✓ HTML `lang` attribute set correctly
- ✓ Screen readers detect language
- ✓ Search engines understand content language
- ✓ Spell-check respects language setting
