# file-share-admin-spa

Admin dashboard for the file-share platform. Browse files, manage share links, and monitor system metrics — all with real-time updates via SignalR.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- SCSS Modules
- [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr) — real-time updates
- [qrcode.react](https://www.npmjs.com/package/qrcode.react) — QR code generation
- Vitest + @testing-library/react — unit tests

## Features

- **File browser** — directory tree + file list, filterable by folder
- **Share management** — create share links with expiration, view QR codes, list active/expired shares
- **System telemetry** — CPU, memory, and disk usage cards
- **Real-time** — file changes and share expirations pushed via SignalR (no refresh needed)

## Development

### Requirements

- Node.js 22+

### Run

```bash
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`. Requires the backend running at `http://localhost:5067` (configured via `.env`).

### Environment

```env
VITE_PUBLIC_BASE_URL=http://localhost:5174
BACKEND_URL=http://localhost:5067
```

### Tests

```bash
npx vitest run
```

## Docker

```bash
docker build -t file-share-admin-spa .
docker run -p 5173:80 file-share-admin-spa
```

## CI/CD

On push to `main`, GitHub Actions builds and pushes the Docker image to `ghcr.io/raphaelm22/file-share-admin-spa:latest`.
