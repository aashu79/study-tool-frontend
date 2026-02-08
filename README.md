# StudyAI - AI-Powered Learning Platform

A modern, production-ready student-focused AI study assistant built with React, TypeScript, Ant Design, and Tailwind CSS.

## 🚀 Features

### Public Pages

- **Landing Page** - Marketing hero, features showcase, and CTAs
- **Login Page** - Email/password authentication with form validation
- **Register Page** - Account creation with password strength meter and terms acceptance

### Technical Features

- ✅ React 19 + TypeScript (strict mode)
- ✅ React Router DOM for navigation
- ✅ Ant Design 6.x for UI components
- ✅ React Hook Form + Yup for form validation
- ✅ Tailwind CSS v4.x for styling
- ✅ react-icons for iconography
- ✅ Fully responsive design (mobile-first)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Production-ready code structure

## 🎨 Design System

### Color Palette

```css
Primary:    #4361ee  (vibrant blue)
Secondary:  #3f37c9  (deep indigo)
Accent:     #4cc9f0  (soft cyan)
Success:    #4ade80  (emerald)
Warning:    #facc15  (amber)
Error:      #f87171  (soft red)
Neutral:    #f8fafc → #0f172a (50-900)
```

### Typography

- Font: Inter (400, 500, 600 weights)
- Base size: 14px
- Scale: responsive (sm → lg breakpoints)

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Site footer
│   │   └── Layout.tsx       # Full-page layout wrapper
│   ├── auth/
│   │   ├── AuthLayout.tsx   # Centered auth card layout
│   │   ├── LoginForm.tsx    # Login form with validation
│   │   └── RegisterForm.tsx # Registration form
│   └── Routes.tsx           # Route definitions
├── pages/
│   ├── Landing.tsx          # Home/landing page
│   ├── Login.tsx            # Login page
│   └── Register.tsx         # Registration page
├── lib/
│   └── validators/
│       └── auth.ts          # Yup schemas + interfaces
├── App.tsx                  # Root component with theme config
└── main.tsx                 # Entry point
```

## 🛠️ Installation

```bash
npm install
npm run dev
```

## 🧭 Routes

| Route       | Page     | Description                    |
| ----------- | -------- | ------------------------------ |
| `/`         | Landing  | Home page with hero + features |
| `/login`    | Login    | User authentication            |
| `/register` | Register | Account creation               |

## 📝 Form Validation

### Login Schema

- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

### Register Schema

- **Full Name**: Required, 2-50 characters
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters
- **Confirm Password**: Must match password
- **Terms**: Must accept terms & privacy policy

## 🎯 Key Components

### Routes Component

Central route configuration imported in `App.tsx`:

```tsx
import Routes from "./components/Routes";
```

### Form Components

- **LoginForm** - Email/password with forgot password link
- **RegisterForm** - Full registration with password strength meter

## 🚦 Development Guidelines

- TypeScript strict mode enabled
- No `any` types
- Interface-based props
- WCAG 2.1 AA accessibility
- Semantic HTML with proper ARIA labels

## 📦 Tech Stack

- React 19
- TypeScript 5.9
- Ant Design 6.1
- React Router DOM
- React Hook Form + Yup
- Tailwind CSS 4.1
- Vite 7.2

---

Built with ❤️ for educational purposes

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
