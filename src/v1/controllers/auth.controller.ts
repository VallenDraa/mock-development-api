import { type Request, type ResponseToolkit } from '@hapi/hapi';
import {
	type Login,
	type ApiResponse,
	type UserWithoutPassword,
	type AccessToken,
	type RegisterData,
} from 'src/v1/models';
import { authService } from 'src/v1/services';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_NAME,
	createAccessTokenOptions,
	createRefreshTokenOptions,
	getAuthorizationToken,
} from 'src/v1/utils/jwt';

export const authController = {
	login(request: Request, h: ResponseToolkit) {
		const loginData = request.payload as Login;

		const { accessToken, refreshToken } = authService.login(loginData);
		const response: ApiResponse<{ accessToken: string; refreshToken: string }> =
			{
				statusCode: 200,
				message: 'Login successful',
				data: { accessToken, refreshToken },
			};

		return (
			h
				.response(response)
				// Set refresh token cookie
				.state(
					REFRESH_TOKEN_COOKIE_NAME,
					refreshToken,
					createRefreshTokenOptions(request.info.hostname),
				)
				// Set access token cookie
				.state(
					ACCESS_TOKEN_COOKIE_NAME,
					accessToken,
					createAccessTokenOptions(request.info.hostname),
				)
		);
	},

	logout(_request: Request, h: ResponseToolkit) {
		const response: ApiResponse<null> = {
			statusCode: 200,
			message: 'Logout successful',
			data: null,
		};

		return h
			.response(response)
			.unstate(REFRESH_TOKEN_COOKIE_NAME)
			.unstate(ACCESS_TOKEN_COOKIE_NAME);
	},

	register(request: Request, h: ResponseToolkit) {
		const registerData = request.payload as RegisterData;

		authService.register(registerData);
		const response: ApiResponse<null> = {
			statusCode: 201,
			message: 'Registration successful',
			data: null,
		};

		return h.response(response).code(201);
	},

	refreshToken(request: Request, h: ResponseToolkit) {
		const refreshToken = getAuthorizationToken(
			request.headers.authorization as string,
		);

		const newAccessToken = authService.refreshToken(refreshToken);

		const response: ApiResponse<{ accessToken: string }> = {
			statusCode: 200,
			message: 'Successfully refreshed access token',
			data: { accessToken: newAccessToken },
		};

		return (
			h
				.response(response)
				// Set access token cookie
				.state(
					ACCESS_TOKEN_COOKIE_NAME,
					newAccessToken,
					createAccessTokenOptions(request.info.hostname),
				)
		);
	},

	refreshTokenCookie(request: Request, h: ResponseToolkit) {
		const refreshToken = (request.state as { refreshToken: string })[
			REFRESH_TOKEN_COOKIE_NAME
		];

		const newAccessToken = authService.refreshToken(refreshToken);

		const response: ApiResponse<{ accessToken: string }> = {
			statusCode: 200,
			message: 'Successfully refreshed access token',
			data: { accessToken: newAccessToken },
		};

		return h
			.response(response)
			.state(
				ACCESS_TOKEN_COOKIE_NAME,
				newAccessToken,
				createAccessTokenOptions(request.info.hostname),
			);
	},

	me(request: Request, h: ResponseToolkit) {
		const { sub } = request.auth.credentials as AccessToken;

		const user = authService.me(sub);
		const response: ApiResponse<{ user: UserWithoutPassword }> = {
			statusCode: 200,
			message: 'Successfully get current user details',
			data: { user },
		};

		return h.response(response);
	},
};
