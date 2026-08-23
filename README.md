# 📈 BitFlow Dashboard

> Modern Bitcoin tracking dashboard with beautiful interactive charts and real-time data

![Bitcoin](https://img.shields.io/badge/Bitcoin-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)
![Nuxt.js](https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

🎨 **Dynamic Charts** - colors change based on trend (green for growth, red for decline)  
📊 **Interactive Tooltips** - detailed information with percentage changes  
⚡ **Real-time Updates** - data updates automatically  
🎯 **Trend Indicator** - visual price direction indicator  
📱 **Responsive Design** - works on all devices  
🚀 **Fast Animations** - smooth transitions and modern UI

## 🛠 Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS
- **Charts**: Chart.js + Vue-ChartJS with custom gradients
- **Backend**: Prisma ORM + PostgreSQL
- **API**: Binance API for real-time price data
- **Styling**: Modern dark theme with gradients


## 🚀 Quick Start

### 1. 📦 Installation

```bash
# Clone the project
git clone https://github.com/authorless/BitFlow-Dashboard.git
cd BitFlow-Dashboard

# Install exactly the tested dependency tree
npm ci
```

### 2. 🗃️ Database Setup

```bash
# Copy environment settings
cp .env.example .env

# Edit .env and use your own password
DATABASE_URL="postgresql://bitflow:change-me@localhost:5432/bitcoin_db"

# Apply the existing migrations
npm run prisma:deploy

# Generate Prisma client
npm run prisma:generate
```

### 3. 🎯 Launch

```bash
# Development mode
npm run dev
# 🌐 http://localhost:3000

# Production build
npm run build
npm run start
```

## 🐳 Automatic Docker Build with GitHub Actions

The project verifies every pull request and publishes a Docker image after a successful push to `main` using GitHub Actions.

The Docker image is published to DockerHub with the tag:
```
<your_dockerhub>/bitflow-dashboard:latest
```

You need to set up the secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` in your repository settings.

Workflow file: `.github/workflows/docker-image.yml`

## 🐳 Docker (Recommended)

```bash
# Create local settings and change POSTGRES_PASSWORD first
cp .env.example .env

# Start the entire environment with one command
npm run docker:up

# Stop
npm run docker:down

# Rebuild images
npm run docker:build
```

## 📁 Project Structure

```
BitFlow-Dashboard/
├── components/
│   └── BitcoinChart.vue       # Interactive chart with animations
├── pages/
│   └── index.vue              # Main dashboard page
├── server/
│   ├── api/                   # REST API endpoints
│   │   ├── price.ts           # Current Bitcoin price
│   │   ├── historical.ts      # Historical data by periods
│   │   └── health.ts          # Application and database health check
│   ├── db/
│   │   └── prisma.ts          # PostgreSQL connection
│   └── services/
│       ├── binance.ts         # Binance API integration
│       ├── database.ts        # Database operations
│       └── historical.ts      # Historical data logic
├── plugins/
│   └── chartjs.client.ts      # Chart.js configuration
├── prisma/
│   └── schema.prisma          # Database schema
└── docker-compose.yml         # Docker environment
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/price` | 💰 Current Bitcoin price |
| `GET` | `/api/historical` | 📊 Historical data by period and timestamp range |
| `GET` | `/api/health` | ❤️ Application and database readiness |

### Request Examples:

```bash
# Current price
curl http://localhost:3000/api/price

# Historical data (timestamps are milliseconds since Unix epoch)
curl "http://localhost:3000/api/historical?period=day&startDate=1755907200000&endDate=1755993600000"

# Health check
curl http://localhost:3000/api/health
```

## ⚙️ Available Scripts

```bash
npm run dev              # 🚀 Start development
npm run build            # 📦 Build for production
npm run start            # 🎯 Start production server
npm run typecheck        # ✅ Validate TypeScript and Vue files
npm run prisma:studio    # 🔍 Open Prisma Studio
npm run prisma:deploy    # 🗃️ Apply existing migrations
npm run prisma:migrate   # 🗃️ Create database migration
npm run prisma:generate  # ⚡ Generate Prisma client
```


## 📋 Requirements

- **Node.js** 24+
- **npm** 11+
- **PostgreSQL** 16 recommended
- **Docker** (recommended)


## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://bitflow:change-me@db:5432/bitcoin_db"
POSTGRES_DB=bitcoin_db
POSTGRES_USER=bitflow
POSTGRES_PASSWORD=change-me

# Market data
BINANCE_API_BASE_URL=https://api.binance.com/api/v3

# Enable only behind a trusted reverse proxy
TRUST_PROXY=false
```

## 🔐 Security and reliability

- API inputs are validated and request ranges are limited to 366 days.
- Public market-data routes have per-client rate limits and upstream timeouts.
- Database refreshes are atomic, and cached prices remain available if the provider fails.
- Production responses include security headers; the Docker app runs as an unprivileged, read-only container.
- Major dependency upgrades require manual review, while CI installs, type-checks, and builds every pull request.

## 🎨 What's New in Design

- ✅ **Dynamic Colors** - chart changes color based on trend
- ✅ **Modern Gradients** - beautiful gradients for chart fills  
- ✅ **Smooth Animations** - fast and responsive transitions (800ms)
- ✅ **Enhanced Tooltips** - show percentage changes
- ✅ **Trend Indicator** - visual price direction indicator
- ✅ **Responsive Design** - looks great on any screen size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📄 License

This project is licensed under the GNU AGPL v3. See [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the crypto community**
