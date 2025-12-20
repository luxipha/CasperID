/**
 * Dynamic Open Graph image generation for CasperID profiles
 * Generates social media preview images for profile sharing
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'CasperID User';
    const id = searchParams.get('id') || '';
    const title = searchParams.get('title') || '';
    const verified = searchParams.get('verified') === 'true';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontSize: 60,
            letterSpacing: -2,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              opacity: 0.3,
            }}
          />

          {/* CasperID Logo/Brand */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 60,
              display: 'flex',
              alignItems: 'center',
              fontSize: 24,
              fontWeight: 600,
              color: 'white',
              opacity: 0.9,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: 'white',
                borderRadius: '50%',
                marginRight: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#667eea',
                }}
              >
                C
              </div>
            </div>
            CasperID
          </div>

          {/* Verification Badge */}
          {verified && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 60,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(34, 197, 94, 0.9)',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 18,
                fontWeight: 600,
                color: 'white',
              }}
            >
              <div style={{ marginRight: 8 }}>✓</div>
              Verified
            </div>
          )}

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 60px',
              textAlign: 'center',
            }}
          >
            {/* Profile Avatar Placeholder */}
            <div
              style={{
                width: 120,
                height: 120,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                marginBottom: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: 'white',
                fontWeight: 700,
                border: '4px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <div
              style={{
                color: 'white',
                fontSize: 48,
                fontWeight: 700,
                marginBottom: 16,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                maxWidth: '900px',
                lineHeight: 1.2,
              }}
            >
              {name}
            </div>

            {/* Title */}
            {title && (
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 24,
                  fontWeight: 400,
                  marginBottom: 20,
                  maxWidth: '800px',
                }}
              >
                {title}
              </div>
            )}

            {/* Human ID */}
            {id && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 20,
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                }}
              >
                {id}
              </div>
            )}
          </div>

          {/* Bottom Text */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 400,
            }}
          >
            Decentralized Identity on Casper Blockchain
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    );
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`);
    
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            color: 'black',
            background: 'white',
            width: '100%',
            height: '100%',
            padding: '50px',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          CasperID Profile
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}