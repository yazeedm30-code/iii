import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthProvider } from '@prisma/client';

export interface SocialIdentity {
  provider: AuthProvider;
  providerUserId: string;
  email?: string;
  fullName?: string;
}

@Injectable()
export class SocialAuthService {
  async verify(
    provider: 'APPLE' | 'GOOGLE',
    identityToken: string,
    fullNameFallback?: string,
  ): Promise<SocialIdentity> {
    if (!identityToken || identityToken.length < 16) {
      throw new BadRequestException({ code: 'INVALID_IDENTITY_TOKEN' });
    }

    // Production note: verify Apple/Google JWTs against their JWKS endpoints,
    // validate `aud`, `iss`, and `exp`. The implementation below is the
    // integration seam — replace with `apple-signin-auth` / `google-auth-library`
    // verifications wired to your client/service identifiers.

    const claims = this.decodeUnverified(identityToken);
    const sub = claims.sub ?? claims.user_id;
    if (typeof sub !== 'string' || sub.length === 0) {
      throw new BadRequestException({ code: 'IDENTITY_TOKEN_MISSING_SUB' });
    }

    return {
      provider: provider === 'APPLE' ? AuthProvider.APPLE : AuthProvider.GOOGLE,
      providerUserId: sub,
      email: typeof claims.email === 'string' ? claims.email : undefined,
      fullName:
        typeof claims.name === 'string'
          ? claims.name
          : fullNameFallback,
    };
  }

  private decodeUnverified(token: string): Record<string, unknown> {
    const segments = token.split('.');
    if (segments.length < 2) {
      throw new BadRequestException({ code: 'MALFORMED_IDENTITY_TOKEN' });
    }
    try {
      const json = Buffer.from(segments[1], 'base64url').toString('utf8');
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      throw new BadRequestException({ code: 'MALFORMED_IDENTITY_TOKEN' });
    }
  }
}
