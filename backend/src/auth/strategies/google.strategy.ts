import { Inject, Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID as string,
      clientSecret: googleConfiguration.clientSecret as string,
      callbackURL: googleConfiguration.callbackURL as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      const email = profile.emails?.[0]?.value;
      const avatarUrl = profile.photos?.[0]?.value;

      if (!email || !avatarUrl) {
        throw new Error('Required Google profile fields are missing');
      }

      const googleUser = {
        email,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatarUrl,
        password: '',
      };

      // Lấy hoặc tạo user, đồng thời set isGoogleAccount = true trong validateGoogleUser
      const user = await this.authService.validateGoogleUser(googleUser, accessToken);
      const userDocument = user as UserDocument;

      // Tạo payload JWT với trường isGoogleAccount = true
      const payload = {
        email: userDocument.email,
        sub: userDocument._id.toString(),
        role: userDocument.role,
        avatarUrl: userDocument.avatarUrl || '',
        isGoogleAccount: true,  // Thêm trường này để frontend nhận diện
      };

      const token = this.authService.getAccessToken(payload);

      done(null, {
        user: {
          id: userDocument._id.toString(),
          name: userDocument.name,
          email: userDocument.email,
          role: userDocument.role,
        },
        access_token: token,
      });
    } catch (error) {
      done(error, false);
    }
  }
}
