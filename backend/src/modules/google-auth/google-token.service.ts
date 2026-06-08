import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAdminService } from '../../common/firebase/firebase-admin.service';
import { VerifiedGoogleUser } from './types/google-auth.types';

@Injectable()
export class GoogleTokenService {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async verifyIdToken(idToken: string): Promise<VerifiedGoogleUser> {
    const auth = this.firebaseAdmin.getAuth();
    if (!auth) {
      throw new UnauthorizedException('Firebase Authentication is not configured on the server');
    }

    try {
      const decoded = await auth.verifyIdToken(idToken, true);

      const email = decoded.email?.trim().toLowerCase();
      if (!email) {
        throw new BadRequestException(
          'Google account has no email. Use an account with a verified email address',
        );
      }

      const name =
        decoded.name?.trim() ||
        [decoded.given_name, decoded.family_name].filter(Boolean).join(' ').trim() ||
        email.split('@')[0];

      return {
        uid: decoded.uid,
        email,
        name,
        picture: decoded.picture,
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new UnauthorizedException('Invalid or expired Google ID token');
    }
  }
}
