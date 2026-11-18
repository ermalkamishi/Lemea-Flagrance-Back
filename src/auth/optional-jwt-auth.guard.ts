import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like AuthGuard('jwt'), but never rejects the request.
 * If a valid Bearer token is present, req.user is populated; otherwise req.user is null.
 * Used for endpoints that work for guests but should know who a logged-in user is.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: any, user: any): TUser {
    return (user || null) as TUser;
  }
}
