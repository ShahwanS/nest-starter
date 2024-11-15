// @Public decorator:
// Used to bypass authentication completely
// Useful when you have global authentication but need some public routes
// Mainly needed for login/signup endpoints

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
