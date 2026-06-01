# Translation System Documentation

## Overview

IBKR Analytics Studio now supports multiple languages with a clean, maintainable translation system. The website is **English-first** (default language) and supports Chinese (Simplified).

## File Structure

### Translation Files

- **[src/translations.js](src/translations.js)** - Centralized translation dictionary
  - Contains all UI text for both English and Chinese
  - Exported as a `translations` object with language keys (`en`, `zh`)
  - Each language has a complete set of key-value pairs

### Usage in App

- **[src/app.js](src/app.js)** - Main application file
  - Imports translations from `src/translations.js`
  - Uses `t(key)` function to retrieve translated text
  - Default language: **English (`en`)**
  - Fallback: English is used if a translation key is missing in other languages

## How It Works

### 1. Import Translations
```javascript
import { translations } from "./translations.js";
```

### 2. Use the Translation Function
```javascript
function t(key) {
  return translations[state.language]?.[key] || translations.en[key] || key;
}
```

### 3. Display Translated Text
```javascript
// In HTML templates:
<h1>${t("uploadTitle")}</h1>

// Returns "Upload Activity Statement" in English
// Returns "上传活动报表" in Chinese
```

## Adding New Text

When adding new display text to the UI:

1. **Do NOT hardcode the text** in HTML or JavaScript
2. **Add a translation key** to [src/translations.js](src/translations.js)
3. **Add both English and Chinese translations**
4. **Use the translation key** in your code with `t(key)`

### Example:
```javascript
// translations.js
export const translations = {
  en: {
    myNewFeature: "My New Feature",
    // ... other keys
  },
  zh: {
    myNewFeature: "我的新功能",
    // ... other keys
  }
};

// In app.js
<button>${t("myNewFeature")}</button>
```

## Language Detection

- **Default**: English (`en`)
- **User Preference**: Stored in `localStorage` as `ibkr-analytics-language`
- **Current State**: Accessible via `state.language`

## Language Switching

Users can toggle between English and Chinese using the language selector buttons in the top navigation. The selection is automatically saved to `localStorage`.

```javascript
// Language toggle buttons in UI
<button class="language-option" type="button" data-language="en">EN</button>
<button class="language-option" type="button" data-language="zh">中</button>
```

## Current Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Default |
| Chinese (Simplified) | `zh` | Supported |

## Translation Coverage

The system currently includes translations for:

- **Navigation**: Tab labels, page titles
- **Upload Section**: File upload instructions, privacy notices
- **Export Guide**: Step-by-step IBKR export instructions
- **Dialogs**: Share image options, settings
- **Data Labels**: Currency, account, asset types, P/L terms
- **UI Controls**: Button labels, placeholders, tooltips
- **Error Messages**: Status and error feedback

## Best Practices

✅ **DO:**
- Use translation keys consistently
- Add translations for ALL user-facing text
- Keep translation keys lowercase with camelCase naming
- Add translations for both languages simultaneously
- Test UI in both English and Chinese

❌ **DON'T:**
- Hardcode display text in HTML templates
- Add untranslated strings to the UI
- Use dynamic text without translation keys
- Add translations for only one language

## Maintaining Translations

When updating existing translations:

1. Edit the corresponding key in [src/translations.js](src/translations.js)
2. Update BOTH the English and Chinese versions
3. Test the changes in both language modes
4. Commit the changes to version control

## Adding a New Language

To support an additional language (e.g., Japanese):

1. Add a new language key to the `translations` object in [src/translations.js](src/translations.js)
2. Duplicate all English translations as a starting point
3. Provide professional translations for each key
4. Add a language button to the UI:
   ```javascript
   <button class="language-option" type="button" data-language="ja">日本語</button>
   ```
5. Update the language switching logic if needed

## Verification

After making changes, verify:

1. ✅ No hardcoded text appears in UI
2. ✅ All text uses `t(key)` translation function
3. ✅ Both English and Chinese versions display correctly
4. ✅ Language switching works properly
5. ✅ Translations persist after page reload
