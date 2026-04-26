import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { UsersService } from '../../modules/users/users.service';

/**
 * Checks that the authenticated user holds at least ONE of the required
 * permission keys. Permissions are resolved transitively via the user's roles.
 *
 * Skips the check when:
 *  - The route is @Public()
 *  - No @RequirePermissions() decorator is present (JWT-only protection)
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // If no permission requirement, just JWT is enough
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    // Fetch the full user with roles and permissions
    const request = context.switchToHttp().getRequest();
    const jwtUser = request.user; // set by GlobalJwtAccessGuard

    const user = await this.usersService.findOne(jwtUser.id);

    // Collect all permission keys across all roles
    const userPermissionKeys = new Set<string>();
    for (const role of user.roles ?? []) {
      for (const permission of role.permissions ?? []) {
        userPermissionKeys.add(permission.key);
        // Support wildcard e.g. "content:*" grants all content permissions
        if (permission.isWildcard) {
          const [module] = permission.key.split(':');
          userPermissionKeys.add(`${module}:*`);
        }
      }
    }

    const hasPermission = requiredPermissions.some(
      (p) =>
        userPermissionKeys.has(p) ||
        // Check module-level wildcard
        userPermissionKeys.has(`${p.split(':')[0]}:*`),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Missing required permission(s): ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
