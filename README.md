# @midkard/forms

A lightweight TypeScript library for enhanced form controls, designed for the DNT WordPress theme.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **FormControl** — Enhanced input controls with floating labels and clear buttons
- 📱 **FormPhone** — Automatic phone number formatting for Russian numbers
- 🔽 **FormCombobox** — Accessible autocomplete combobox with keyboard navigation
- ♿ **Accessible** — WAI-ARIA compliant components
- 🚀 **Lightweight** — No dependencies, vanilla TypeScript
- 📦 **TypeScript** — Full type support with extensible namespace

## Installation

```bash
npm install @midkard/forms
```

## Usage

### Basic Setup

Import the library and styles:

```typescript
import '@midkard/forms'
import '@midkard/forms/style'
```

Or import directly in your HTML:

```html
<link rel="stylesheet" href="node_modules/@midkard/forms/lib/forms.css">
<script type="module" src="node_modules/@midkard/forms/lib/forms.js"></script>
```

### FormControl

Form controls are automatically initialized for elements with `data-dnt-form-control` attribute:

```html
<div class="form-control form-control_floating form-control_clearable" data-dnt-form-control>
  <input type="text" name="username" id="username" required>
  <label for="username">Username</label>
</div>
```

**CSS Classes:**
- `form-control_floating` — Floating label animation
- `form-control_clearable` — Adds a clear button to the input
- `form-control_empty` — Automatically toggled based on input value

### FormPhone

Phone inputs (with `type="tel"`) are automatically formatted:

```html
<div class="form-control form-control_floating" data-dnt-form-control>
  <input type="tel" name="phone" id="phone" required>
  <label for="phone">Phone number</label>
</div>
```

**Features:**
- Automatically formats Russian phone numbers: `+7 (XXX) XXX-XX-XX`
- Normalizes various input formats (8, +7, 7 prefixes)
- Limits to 11 digits

### FormCombobox

Create accessible combobox/dropdown components:

```html
<div class="form-control" data-dnt-form-combobox>
  <input type="text" 
         role="combobox" 
         aria-autocomplete="list" 
         aria-expanded="false"
         aria-controls="listbox1"
         placeholder="Select an option">
  
  <ul role="listbox" id="listbox1">
    <li role="option" value="1">Option 1</li>
    <li role="option" value="2">Option 2</li>
    <li role="option" value="3">Option 3</li>
  </ul>
</div>
```

**Features:**
- Keyboard navigation (Arrow keys, Enter, Escape, Tab)
- Filtering with `aria-autocomplete="list"` or `"both"`
- Dynamic positioning (opens upward if not enough space below)
- Auto-closes on outside click
- Supports clearable button

## Programmatic API

Access form components programmatically:

```typescript
import { dntForms } from '@midkard/forms'

// Create a phone input manually
const container = document.querySelector('#my-phone') as HTMLDivElement
const phone = new dntForms.FormPhone(container)

// Create a combobox
const comboboxContainer = document.querySelector('#my-combobox') as HTMLDivElement
const combobox = new dntForms.FormCombobox(comboboxContainer)

// Open/close combobox programmatically
combobox.open()
combobox.close()

// Cleanup
combobox.destroy()
```

## Extending Types

The library uses declaration merging for extensibility:

```typescript
declare module '@midkard/forms' {
  namespace DntForms {
    export interface MyCustomForm {
      customMethod(): void
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the library
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT © [Dimenius Novus](https://dn-ms.ru)
