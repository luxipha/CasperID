# CasperID - Reusable Digital Identity for Web3

> **Verify once, reuse everywhere** - A portable, consent-based identity layer for Web2 and Web3 platforms.

[![Next.js](https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6)](https://www.typescriptlang.org/)
[![Casper](https://img.shields.io/badge/-Casper-black?style=for-the-badge&logoColor=white&logo=casper&color=FF473A)](https://casper.network/)
[![Gemini](https://img.shields.io/badge/-Gemini_AI-black?style=for-the-badge&logoColor=white&logo=google&color=4285F4)](https://ai.google.dev/)

## 🎯 Problem

Identity verification is broken — especially in Web3:
- **Web2**: Repeated uploads, liveness checks, same forms across platforms
- **Web3**: Wallets prove ownership, not humanity. Sybil attacks are common
- **DAOs/dApps**: Struggle to verify real users without fragmented, centralized KYC

## 💡 Solution

CasperID is a **reusable digital identity layer** that allows users to verify their identity once and reuse it across Web2 and Web3 platforms.

### Key Benefits
- 🔐 **Verify once, reuse everywhere**
- ⚡ **One-tap login** with "Login with CasperID"
- 🛡️ **Prevent bots and Sybil abuse**
- 🚀 **Faster onboarding** without sacrificing privacy
- 📝 **Smart form autofill** for job applications, shopping, bookings
- 🎯 **User-controlled data** with consent-based sharing

## ✨ Features

### Multi-Modal KYC Verification
- **Document Analysis**: Gemini 1.5 Pro analyzes government IDs
- **Face Matching**: Advanced computer vision for ID photo comparison
- **Liveness Detection**: Sequence-based verification with anti-spoofing
- **Confidence Scoring**: Only approves verifications with >70% confidence

### AI-Powered Resume Engine
- **Lightning-fast parsing**: PDF/Word → structured JSON in <10 seconds
- **Comprehensive extraction**: Work experience, education, skills, certifications
- **Powered by**: Google Gemini 2.5 Flash

### Human-Readable Wallet Algorithm
- **Collision-resistant mapping**: `0x1a2b3c...` → `friendly-username`
- **Markov chain generation**: 4-segment words with phonetic syllables
- **Zero collisions** across 100M+ test wallets
- **Fully reversible** and deterministic

### Browser Extension
- **Cross-site integration**: Seamless Web3 authentication
- **Form autofill**: AI-generated cover letters and application data
- **Granular permissions**: Users control what data is shared
- **Real-time notifications**: Credential updates and access requests

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** with App Router for optimal SEO
- **TypeScript** for type safety
- **Tailwind CSS + Framer Motion** for polished UX
- **React Context** for real-time state management

### Backend & AI
- **Node.js/Express** API with JWT rotation security
- **Google Gemini 1.5 Pro** for document verification
- **Google Gemini 2.5 Flash** for resume parsing
- **MongoDB** for profile and verification data

### Blockchain & Security
- **Casper Network** smart contracts in Rust
- **Immutable audit trail** with credential revocation
- **Adversarial attack detection** in verification flows
- **PII encryption** for sensitive data storage

### Observability
- **Datadog Integration** for comprehensive monitoring:
  - LLM token usage and cost tracking
  - Fraud detection and geographic performance
  - Business KPIs and ML model quality metrics
  - 7 detection rules for automated incident management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud account (for Gemini API)
- Casper Signer wallet extension

### 1. Clone Repository
```bash
git clone https://github.com/luxipha/CasperID.git
cd CasperID
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 3. Environment Setup
```bash
# Backend configuration
cp server/.env.example server/.env
# Fill in your API keys and database URLs

# Frontend configuration  
cp .env.example .env.local
# Configure your API endpoints
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see CasperID in action.

## 📁 Project Structure

```
CasperID/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
├── server/                 # Express.js API backend
│   ├── src/routes/        # API endpoints
│   ├── src/services/      # Gemini AI, Casper integration
│   └── datadog-monitors/  # Observability configuration
├── extension/             # Chrome extension
├── contracts/casper/      # Rust smart contracts
└── lib/                   # Shared utilities
```

## 🎯 Use Cases

- **dApp onboarding & authentication**
- **DAO membership verification** 
- **Job applications** with AI-powered matching
- **Airdrop protection** against Sybil attacks
- **Fintech onboarding** with reusable KYC
- **Marketplaces** requiring identity verification
- **Remote work platforms** with verified profiles

## 🔗 API Endpoints

### Identity Verification
- `GET /api/identity-status?wallet=<address>` - Check verification status
- `POST /api/request-verification` - Submit verification request
- `POST /api/mint-basic-id` - Auto-mint basic credentials

### Profile Management
- `GET /api/profile/<wallet>` - Get user profile
- `GET /api/public-profile/<identifier>` - Public profile view
- `PUT /api/profile/<wallet>` - Update profile data

### AI Services
- `POST /api/ai/parse-resume` - Extract structured data from resumes
- `POST /api/ai/generate-cover-letter` - Create personalized cover letters

## 📊 Datadog Integration

CasperID features comprehensive observability:

### Metrics Tracked
- **Token Usage**: Gemini API costs per verification
- **Confidence Scores**: AI model performance tracking  
- **Geographic Analytics**: Fraud patterns by region
- **Business KPIs**: Cost per verification, success rates

### Detection Rules
1. Low confidence verification attempts
2. Cost anomaly detection  
3. Success rate degradation
4. High latency alerts
5. Fraud pattern recognition
6. Error rate spikes
7. PII leak detection

## 🛡️ Security Features

- **Adversarial attack detection** for synthetic data
- **JWT token rotation** with blacklist management
- **Rate limiting** and DDoS protection
- **Geographic fraud monitoring**
- **PII encryption** for sensitive storage
- **Immutable blockchain audit trail**

## 🎯 Unique Value Propositions

- **Zero-friction onboarding**: Connect existing Casper wallets
- **AI resume magic**: 30-minute → 10-second profile creation  
- **Sybil-resistance-as-a-service**: Simple API for dApp integration
- **Human-first URLs**: `casperid.com/profile/friendly-name`
- **Comprehensive verification**: Basic ID + Full KYC + Liveness

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submissions

- **Datadog Challenge**: Innovative LLM observability with Gemini integration
- **Google Cloud**: AI-powered identity verification using Vertex AI/Gemini

## 📞 Support

- **Documentation**: Check `/server/README.md` for API docs
- **Issues**: Open a GitHub issue for bugs or feature requests  
- **Community**: Join our discussions for questions and feedback

---

**Built with ❤️ for the decentralized future**