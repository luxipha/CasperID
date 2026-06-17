# Changelog

All notable changes to the CasperID React SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-06-16

### Added
- **Hosted Authorization Flow**: All authentication, onboarding, passkey, and verification moved to `account.casperid.com/authorize`
- **Lightweight OAuth/PKCE Client**: New public API with `authorizeWithCasperID()`, `consumeHostedAuthorizationCallback()`, `useHostedAuthorizationCallback()`, and `<CasperIDButton>`
- **Transport Modes**: `CasperIDButton` supports `auto`, `popup`, and `redirect` modes; auto uses popup on desktop and redirect where appropriate
- **Provisional L3 Support**: SDK returns provisional authorization state for users with pending L3 KYC
- **Authorization States**: Complete, provisional, denied, cancelled, and failed — all surfaced to partner applications

### Changed
- SDK v2 is now a thin OAuth client — opens the hosted flow, receives the authorization result, and exposes it to partner apps
- Popup flow resolves directly after receiving the trusted callback message
- Redirect flow uses `useHostedAuthorizationCallback` for callback consumption
- Callback consumption is idempotent under React Strict Mode with origin, state, and PKCE validation
- Popup closure treated as cancellation only after confirming no valid callback was received
- Package source was reduced to the hosted authorization surface only

### Fixed
- Mobile and PWA redirect callbacks now recover hosted authorization transactions from durable same-origin storage when `sessionStorage` is lost across the browser handoff.
- Expired hosted authorization transactions are removed from both session and durable storage before surfacing the invalid-or-expired state error.

### Removed
- **`<CasperIDModal>`** — fully removed in favor of hosted authorization
- **Embedded signup and KYC screens** — moved to `account.casperid.com`
- **Modal-only APIs** — no longer exported
- **Heavy browser verification dependencies** — drastically reduced bundle size
- **Legacy internal screen, shared UI, and WebAuthn helper files** — removed from the React package source

### Technical
- Public TypeScript types are now limited to hosted authorization request/response contracts
- Backend enforcement is authoritative; frontend tier checks improve UX but cannot bypass required verification levels
- Patch release on top of the hosted authorization architecture introduced in `2.0.0`

## [1.1.0] - 2026-05-02

### Fixed
- **Light Mode Visibility**: Fixed invisible text, borders, and backgrounds in light mode across all 14 screens
- **Theme Consistency**: Replaced hardcoded `text-slate-*` and `dark:` classes with theme-aware CSS variables
- **Glass Container Effects**: Unified backdrop blur effects to work seamlessly in both light and dark modes
- **Input Placeholders**: Fixed placeholder text visibility in both themes
- **Progress Indicators**: Fixed progress bars and status indicators to use brand colors instead of hardcoded grays

### Changed
- Migrated all UI components to use semantic color classes (`text-main`, `text-muted`, `bg-brand-*`, `border-brand-*`)
- Improved contrast ratios for better accessibility in both light and dark modes
- Enhanced glass morphism effects with proper theme adaptation

### Technical
- Updated CSS variable system for better theme switching
- Optimized theme-aware utility classes for smaller bundle size
- Maintained backwards compatibility with existing theme prop API

## [1.0.2] - 2026-04-17

### Fixed
- CSRF security: Exempted authentication routes from CSRF checks for cross-origin SDK requests
- Device detection: Fixed extension button visibility logic for mobile vs desktop
- Origin parsing: Hardened business dashboard to parse comma-separated origin lists

### Changed
- Enhanced SDK stability for cross-origin integration scenarios

## [1.0.1] - 2026-03-19

### Added
- Multi-language support (English, Spanish, French, German)
- Flexible layout modes: Auto, Modal, and Fullscreen
- Passkey-first onboarding flow

### Fixed
- Mobile liveness UI rendering issues
- WebAuthn compatibility across different browsers

## [1.0.0] - 2026-03-10

### Added
- Initial public release
- Biometric liveness verification
- Document scanning (Passport, Driver's License, National ID)
- Passkey (WebAuthn) authentication
- Layer 1, 2, and 3 verification support
- Customizable theming (light/dark modes, primary color, border radius)
- Privacy-first selective disclosure
- Decentralized identity (DID) integration

### Features
- `<CasperIDModal>` component for embeddable identity verification
- Session token management
- Business token for server-side verification
- Real-time verification status updates
- Mobile-responsive design
- AI-powered document OCR
- Face mesh detection for liveness checks

[1.1.0]: https://github.com/luxipha/CasperID-sdk/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/luxipha/CasperID-sdk/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/luxipha/CasperID-sdk/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/luxipha/CasperID-sdk/releases/tag/v1.0.0
