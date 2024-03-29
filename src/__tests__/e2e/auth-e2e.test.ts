import {
	type ErrorApiResponse,
	type ApiResponse,
	type Login,
	type UserWithoutPassword,
	type RegisterData,
} from 'src/models';
import request from 'supertest';
import { type Server } from '@hapi/hapi';
import { createServer } from 'src/server';
import jwt from 'jsonwebtoken';
import { registerDataMock } from 'src/__tests__/mocks';

describe('Auth e2e', () => {
	let server: Server;

	beforeAll(async () => {
		server = await createServer(true);
	});

	describe('POST /auth/register', () => {
		const sendRegisterData = (data: object, status: number) =>
			request(server.listener)
				.post('/auth/register')
				.send(data)
				.expect(status)
				.expect('Content-Type', /json/);

		it('Should register new user and return 201 status code', async () => {
			await sendRegisterData(registerDataMock, 201).then(response => {
				const body = response.body as ApiResponse<null>;
				expect(body.data).toBeNull();
				expect(body.message).toStrictEqual('Registration successful');
				expect(body.statusCode).toStrictEqual(201);
			});
		});

		it('Should return 400 status code when there is a duplicate user in the database', async () => {
			await sendRegisterData(registerDataMock, 400)
				.expect('Content-Type', /json/)
				.then(response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Bad Request');
					expect(body.message).toStrictEqual('User already exists');
					expect(body.statusCode).toStrictEqual(400);
				});
		});

		it('Should return 400 status code if missing required fields', async () => {
			// Missing username
			await sendRegisterData(
				{
					email: 'fake@gmail.com',
					confirmPassword: 'fake123456',
					password: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Username is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing email
			await sendRegisterData(
				{
					username: 'fake',
					confirmPassword: 'fake123456',
					password: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Email is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing password
			await sendRegisterData(
				{
					username: 'fake',
					email: 'fake@gmail.com',
					confirmPassword: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Password is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing password confirmation
			await sendRegisterData(
				{
					username: 'fake',
					email: 'fake@gmail.com',
					password: 'fake123456',
				},
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual(
					'Password confirmation is invalid or missing',
				);
				expect(body.statusCode).toStrictEqual(400);
			});
		});

		it("Should return 400 status code if 'password' and 'confirmPassword' do not match", async () => {
			await sendRegisterData(
				{
					email: 'jono@gmail.com',
					username: 'jono',
					password: 'jono123456',
					confirmPassword: 'jono1234563',
				} as RegisterData,
				400,
			).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual(
					'Password and confirm password do not match',
				);
				expect(body.statusCode).toStrictEqual(400);
			});
		});
	});

	describe('POST /auth/login', () => {
		const loginData: Login = {
			email: 'fake@gmail.com',
			password: 'fake1234567',
		};

		const sendLoginData = (data: object, status: number) =>
			request(server.listener)
				.post('/auth/login')
				.send(data)
				.expect(status)
				.expect('Content-Type', /json/);

		it('Should give access token and refresh token when user login successfully', async () => {
			await sendLoginData(loginData, 200).then(response => {
				const body = response.body as ApiResponse<{
					accessToken: string;
					refreshToken: string;
				}>;

				expect(body.statusCode).toStrictEqual(200);
				expect(body.message).toStrictEqual('Login successful');
				expect(typeof body.data.accessToken).toStrictEqual('string');
				expect(typeof body.data.refreshToken).toStrictEqual('string');
			});
		});

		it('Should return 401 status code if credentials are invalid', async () => {
			await sendLoginData({ ...loginData, password: '231231232' }, 401).then(
				response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Unauthorized');
					expect(body.message).toStrictEqual('Invalid email or password');
					expect(body.statusCode).toStrictEqual(401);
				},
			);
		});

		it('Should return 400 status code if missing required fields', async () => {
			// Missing email
			await sendLoginData({ password: '123213' }, 400).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Email is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});

			// Missing password
			await sendLoginData({ email: 'fake@gmail.com' }, 400).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Bad Request');
				expect(body.message).toStrictEqual('Password is invalid or missing');
				expect(body.statusCode).toStrictEqual(400);
			});
		});
	});

	describe('GET /auth/me', () => {
		const sendMeRequest = (status: number, accessToken?: string) => {
			const req = request(server.listener).get('/auth/me');

			if (accessToken) {
				void req.set('Authorization', `Bearer ${accessToken}`);
			}

			return req.expect(status).expect('Content-Type', /json/);
		};

		it("Should return 401 when access token in header isn't provided", async () => {
			await sendMeRequest(401).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Missing authentication');
				expect(body.statusCode).toStrictEqual(401);
			});
		});

		it('Should return 401 when access token in header is invalid or expired', async () => {
			// Invalid token
			await sendMeRequest(401, 'invalid-token').then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Missing authentication');
				expect(body.statusCode).toStrictEqual(401);
			});

			// Create expired token
			const expiredToken = await request(server.listener)
				.post('/auth/login')
				.send({ email: 'fake@gmail.com', password: 'fake1234567' })
				.then(({ body }) => {
					const { accessToken } = (body as ApiResponse<{ accessToken: string }>)
						.data;

					const userId = jwt.decode(accessToken)!.sub as string;
					return jwt.sign({}, process.env.ACCESS_TOKEN_SECRET, {
						subject: userId,
						expiresIn: '0s',
					});
				});

			// Expired token
			await sendMeRequest(401, expiredToken).then(response => {
				const body = response.body as ErrorApiResponse;

				expect(body.error).toStrictEqual('Unauthorized');
				expect(body.message).toStrictEqual('Expired token');
				expect(body.statusCode).toStrictEqual(401);
			});
		});

		it('Should return user details when access token is valid', async () => {
			const accessToken = await request(server.listener)
				.post('/auth/login')
				.send({ email: 'fake@gmail.com', password: 'fake1234567' })
				.then(
					({ body }) =>
						(body as ApiResponse<{ accessToken: string }>).data.accessToken,
				);

			await sendMeRequest(200, accessToken).then(response => {
				const body = response.body as ApiResponse<{
					user: UserWithoutPassword;
				}>;

				expect(body.statusCode).toStrictEqual(200);
				expect(body.message).toStrictEqual(
					'Successfully get current user details',
				);
				expect(Object.keys(body.data.user)).toStrictEqual([
					'id',
					'email',
					'username',
					'profilePicture',
					'createdAt',
					'updatedAt',
				]);
			});
		});
	});

	describe('POST /auth/refresh-token', () => {
		const getTokens = async () =>
			request(server.listener)
				.post('/auth/login')
				.send({ email: 'fake@gmail.com', password: 'fake1234567' })
				.then(response => {
					const body = response.body as ApiResponse<{
						accessToken: string;
						refreshToken: string;
					}>;

					return body.data;
				});

		it("Should return 401 status code if 'refreshToken' is invalid or expired", async () => {
			const userId = jwt.decode((await getTokens()).accessToken)!.sub as string;
			const expiredRefreshToken = jwt.sign(
				{},
				process.env.REFRESH_TOKEN_SECRET,
				{ subject: userId, expiresIn: '0s' },
			);

			await request(server.listener)
				.post('/auth/refresh-token')
				.send({ refreshToken: expiredRefreshToken })
				.expect(401)
				.then(response => {
					const body = response.body as ErrorApiResponse;

					expect(body.error).toStrictEqual('Unauthorized');
					expect(body.message).toStrictEqual('Refresh token expired');
					expect(body.statusCode).toStrictEqual(401);
				});
		});

		it("Should return new access token if 'refreshToken' is valid", async () => {
			const refreshToken = await getTokens().then(
				tokens => tokens.refreshToken,
			);

			await request(server.listener)
				.post('/auth/refresh-token')
				.send({ refreshToken })
				.expect(200)
				.then(response => {
					const body = response.body as ApiResponse<{ accessToken: string }>;

					expect(body.statusCode).toStrictEqual(200);
					expect(body.message).toStrictEqual(
						'Successfully refreshed access token',
					);
					expect(typeof body.data.accessToken).toStrictEqual('string');
				});
		});
	});
});
