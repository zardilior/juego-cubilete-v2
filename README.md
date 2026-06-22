# boardgame.io + TypeScript React Project

A modern, fully type-safe boilerplate setup for building board games with `boardgame.io`, React, Vite, and TypeScript. Includes a pre-configured unit testing environment using Vitest.

This boilerplate includes a modernized, animated, and glowing **Tic-Tac-Toe** game showcasing how to design rules, player states, turn transitions, and custom victory indicators.

## 🚀 Quick Start Instructions

Since Node.js is not yet installed on your system, please follow these steps to get the project running.

### 1. Install Node.js & npm

The recommended way to install Node.js on macOS is via [Homebrew](https://brew.sh/). If you do not have Homebrew, you can install it or download the official installer directly from [nodejs.org](https://nodejs.org/).

**Using Homebrew (Terminal):**
```bash
# 1. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node
```

Once installed, verify they are active:
```bash
node --version
npm --version
```

---

### 2. Install Project Dependencies

Open your terminal, navigate to the project directory, and run:
```bash
cd /Users/joseefort/personal_code/boardgame-ts-app
npm install
```

---

### 3. Run the Development Server

Start the interactive development server:
```bash
npm run dev
```
Open the provided local URL (usually `http://localhost:5173`) in your browser to play the game!

---

### 4. Run the Tests

We've configured **Vitest** for testing the boardgame.io logic. To run the tests in interactive watch mode, use:
```bash
npm run test
```

To run the tests once (useful for CI/CD or verification checks):
```bash
npm run test -- --run
```

---

## 📁 Project Structure

```text
├── index.html              # Entry HTML point
├── package.json            # Scripts and dependencies config
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite & Vitest configuration
└── src/
    ├── main.tsx            # React application entry
    ├── App.tsx             # Bootstraps boardgame.io Client
    ├── Board.tsx           # React UI component for the game board
    ├── Game.ts             # boardgame.io Game State logic & rules
    ├── Game.test.ts        # Vitest suite verifying game mechanics
    ├── types.ts            # Shared TypeScript types & game state G
    ├── setupTests.ts       # Testing environment setup
    └── index.css           # Premium glassmorphic styles
```
