# NETS - Node.js Express TypeScript/JavaScript Scaffolder

[![NPM version](https://img.shields.io/npm/v/@dgreegman/nets.svg)](https://www.npmjs.com/package/@dgreegman/nets)
[![License](https://img.shields.io/npm/l/@dgreegman/nets.svg)](https://github.com/DGreegman/nets/blob/main/LICENSE)

A simple, interactive CLI tool to quickly scaffold a new Node.js project using the Express framework. Get a production-ready setup for either **TypeScript** or **JavaScript** in seconds.

## Features

- **Interactive Setup:** Guides you through the project creation process.
- **Language Choice:** Supports both TypeScript and standard JavaScript.
- **Database Integration:** Choose between Mongoose, Sequelize, Prisma, or no database at all.
- **Testing Framework:** Optionally include Jest for testing.
- **Modern Project Structure:** Creates a logical and scalable directory structure (controllers, services, routes, etc.).
- **Optimized Tooling:** Comes with ESLint, Prettier, and an optimized `tsconfig.json` for TypeScript projects.
- **Faster Installation:** Automatically detects and uses `pnpm` or `yarn` if available, resulting in a faster and more efficient setup.
- **Essential Scripts:** `package.json` is pre-configured with `dev`, `start`, `build`, and `test` scripts.
- **Automatic `.gitignore` and `.env`:** Generates essential `.gitignore` and `.env` files from the start.
- **User-Friendly Feedback:** Displays a loading spinner during dependency installation.
- **CI/CD Ready:** Includes a basic GitHub Actions workflow for automated testing.

## Usage

To create a new project, run the following command in your terminal:

```bash
npx @dgreegman/nets
```

The tool will then prompt you for the following information:

1.  **Project Name:** The name of your new application (e.g., `my-api`).
2.  **Language:** Your choice of either `TypeScript` or `JavaScript`.
3.  **Database:** Your choice of database integration: `Mongoose`, `Sequelize`, `Prisma`, or `None`.
4.  **Jest:** Whether to include Jest for testing.

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
├── jest.config.js (if Jest is included)
├── package.json
├── prisma/ (if Prisma is selected)
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── db.ts (or .js)
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

feat/db-swagger
## Database Integration

NETS supports the following database integrations:

- **Mongoose:** A popular ODM for MongoDB.
- **Sequelize:** A promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.
- **Prisma:** A next-generation ORM for Node.js and TypeScript.

When you select a database, NETS will install the required dependencies and create a configuration file in `src/config/db.ts` (or `.js`). You will need to update this file with your database connection details.

## Testing with Jest

If you choose to include Jest, NETS will install the required dependencies and create a `jest.config.js` file in the root of your project. You can then create your test files in a `__tests__` directory or with a `.test.ts` (or `.js`) extension.

To run your tests, use the following command:

```bash
npm test
```

## Environment Variables

NETS uses the `dotenv` package to load environment variables from a `.env` file in the root of your project. You can add your environment variables to this file, and they will be available in your application via `process.env`.
=======
## Collaborators

Thanks to all the amazing contributors to this project ❤️

<p>
  <a href="https://github.com/Couragenwanduka">
    <img src="./assets/collaboratorCourage.png" width="120" style="border-radius:40%;" alt="Courage Nduka"/>
    <br />
    <b>Courage Nduka</b>
  </a>
  <br />
  <i>courageobunike@gmail.com</i>
  <br />
  <i>Software Developer</i>
</p>
main

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
