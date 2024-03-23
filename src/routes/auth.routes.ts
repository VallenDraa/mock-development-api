import { type ServerRoute } from '@hapi/hapi';
import { authController } from 'src/controllers/auth.controller';
import { failAction } from 'src/utils/fail-action-response';
import {
	loginValidator,
	refreshTokenValidator,
	registerValidator,
} from 'src/validators';

export const authRoutes: ServerRoute[] = [
	{
		path: '/auth/login',
		method: 'POST',
		options: {
			auth: false,
			validate: {
				failAction,
				payload: loginValidator,
			},
		},
		handler: authController.login,
	},
	{
		path: '/auth/register',
		method: 'POST',
		options: {
			auth: false,
			validate: {
				failAction,
				payload: registerValidator,
			},
		},
		handler: authController.register,
	},

	{
		path: '/auth/refresh-token',
		method: 'POST',
		options: {
			auth: false,
			validate: {
				failAction,
				payload: refreshTokenValidator,
			},
		},
		handler: authController.refreshToken,
	},
	{
		path: '/auth/me',
		method: 'GET',
		handler: authController.me,
	},
];
