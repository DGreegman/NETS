# NETS - Node.js Express TypeScript/JavaScript Scaffolder

[![NPM version](https://img.shields.io/npm/v/@dgreegman/nets.svg)](https://www.npmjs.com/package/@dgreegman/nets)
[![License](https://img.shields.io/npm/l/@dgreegman/nets.svg)](https://github.com/DGreegman/nets/blob/main/LICENSE)

A simple, interactive CLI tool to quickly scaffold a new Node.js project using the Express framework. Get a production-ready setup for either **TypeScript** or **JavaScript** in seconds.

## Features

- **Interactive Setup:** Guides you through the project creation process.
- **Language Choice:** Supports both TypeScript and standard JavaScript.
- **Modern Project Structure:** Creates a logical and scalable directory structure (controllers, services, routes, etc.).
- **Optimized Tooling:** Comes with ESLint, Prettier, and an optimized `tsconfig.json` for TypeScript projects.
- **Faster Installation:** Automatically detects and uses `pnpm` or `yarn` if available, resulting in a faster and more efficient setup.
- **Essential Scripts:** `package.json` is pre-configured with `dev`, `start`, and `build` scripts.
- **Automatic `.gitignore` and `.env`:** Generates essential `.gitignore` and `.env` files from the start.
- **User-Friendly Feedback:** Displays a loading spinner during dependency installation.

## Usage

To create a new project, run the following command in your terminal:

```bash
npx @dgreegman/nets
```

The tool will then prompt you for the following information:

1.  **Project Name:** The name of your new application (e.g., `my-api`).
2.  **Language:** Your choice of either `TypeScript` or `JavaScript`.

That's it! The tool will create a new directory with your project name and install all the necessary dependencies.

```bash
✔ Dependencies installed with pnpm.
✔ Project my-api is set up and ready to go!
```

## Generated Project Structure

NETS will generate the following directory structure for your new project:

```
my-api/
├── .env
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── package.json
├── src/
│   ├── controllers/
│   ├── email/
│   ├── errors/
│   ├── index.ts (or .js)
│   ├── interfaces/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
└── tsconfig.json (if TypeScript)
```

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.