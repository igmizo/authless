# Authless - WebAuthn Demo

A demonstration project showing how to implement WebAuthn (Web Authentication) using Next.js, Prisma, and SimpleWebAuthn.

## Features

- Passwordless authentication using WebAuthn
- User registration and login with biometric authentication
- PostgreSQL database for storing user credentials
- Built with Next.js 15 and TypeScript

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React Framework
- [prisma](https://www.prisma.io/) - Prisma ORM

## Getting Started

### Prerequisites

- Node.js 20.0 or later
- npm or yarn
- PostgreSQL database
- A WebAuthn-capable browser and device (most modern browsers support WebAuthn)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/igmizo/authless.git
cd echo
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your Redis URL:

```env
DATABASE_URL="your-postgres-url"
NEXT_PUBLIC_RP_ID="localhost"
NEXT_PUBLIC_ORIGIN="http://localhost:3000"
```

4. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The easiest way to deploy Authless is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Figmizo%2Fauthless)

Don't forget to add your environment variables to your Vercel environment variables.

## Local Development

To run the project locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/) - Prisma ORM
- [SimpleWebAuthn](https://simplewebauthn.dev/)

---

Made with ❤️ by Ivars Gmizo
