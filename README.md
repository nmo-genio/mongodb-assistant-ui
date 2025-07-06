# MongoMentor UI

MongoMentor is a simple chat-based interface for asking questions about MongoDB.
It is built with [Next.js](https://nextjs.org/) and Tailwind CSS.
The UI communicates with a backend service that returns answers to your questions.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.

The chat component sends questions to `http://10.0.0.136:8000/api/query`. If your
backend runs elsewhere, update the endpoint in
`src/app/page.tsx` accordingly.

## Project Structure

- `src/app/page.tsx` – main chat page
- `src/app/layout.tsx` – application layout and fonts
- `public/` – static assets such as images

## Deployment

This app can be deployed like any Next.js project. Refer to the
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
for options and best practices.
