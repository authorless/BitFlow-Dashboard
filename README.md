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

- **Frontend**: Nuxt 3, Vue 3, TypeScript, Tailwind CSS
- **Charts**: Chart.js + Vue-ChartJS with custom gradients
- **Backend**: Prisma ORM + PostgreSQL
- **API**: Binance API for real-time price data
- **Styling**: Modern dark theme with gradients


## 🚀 Quick Start

### 1. 📦 Installation

```bash
# Clone the project
git clone <repository-url>
cd BitFlow-Dashboard

# Install dependencies
npm install
```

### 2. 🗃️ Database Setup

```bash
# Copy environment settings
cp .env.example .env

# Edit .env file with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bitcoin_db"

# Apply migrations
npm run prisma:migrate

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

The project automatically builds and publishes a Docker image on every push to the `main` branch using GitHub Actions.

The Docker image is published to DockerHub with the tag:
```
<your_dockerhub>/bitflow-dashboard:latest
```

You need to set up the secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` in your repository settings.

Workflow file: `.github/workflows/docker.yml`

## 🐳 Docker (Recommended)

```bash
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
│   │   └── health.ts          # System health check
│   ├── db/
│   │   └── prisma.ts          # PostgreSQL connection
│   └── services/
│       ├── binance.ts         # Binance API integration
│       ├── database.ts        # Database operations
│       └── historical.ts      # Historical data logic
├── plugins/
│   ├── prisma.server.ts       # Prisma client
│   └── chartjs.client.ts      # Chart.js configuration
├── prisma/
│   └── schema.prisma          # Database schema
└── docker-compose.yml         # Docker environment
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/price` | 💰 Current Bitcoin price |
| `GET` | `/api/historical` | 📊 Historical data by periods |
| `GET` | `/api/health` | ❤️ System health check |

### Request Examples:

```bash
# Current price
curl http://localhost:3000/api/price

# Historical data for one day
curl http://localhost:3000/api/historical?period=day

# Health check
curl http://localhost:3000/api/health
```

## 🐳 Docker (Recommended)

```bash
# Start entire environment with one command
npm run docker:up

# Stop
npm run docker:down

# Rebuild images
npm run docker:build
```

## ⚙️ Available Scripts

```bash
npm run dev              # 🚀 Start development
npm run build            # 📦 Build for production
npm run start            # 🎯 Start production server
npm run prisma:studio    # 🔍 Open Prisma Studio
npm run prisma:migrate   # 🗃️ Create database migration
npm run prisma:generate  # ⚡ Generate Prisma client
```


## 📋 Requirements

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**
- **Docker** (recommended)


## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/bitcoin_db"
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=bitcoin_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# API keys (if needed)
# BINANCE_API_KEY=your_api_key
# BINANCE_SECRET_KEY=your_secret_key
```

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
