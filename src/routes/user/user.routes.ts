import { type ServerRoute } from '@hapi/hapi';
import { userController } from 'src/controllers';
import { failAction } from 'src/utils/fail-action-response';
import {
	idValidator,
	paginateValidator,
	createUserValidator,
	editUserPasswordValidator,
	editUserValidator,
} from 'src/validators';
import { usersSwagger } from './user.swagger';

export const userRoutes: ServerRoute[] = [
	{
		path: '/users',
		method: 'GET',
		options: {
			description: 'Get all users.',
			notes: 'Gets all users in a paginated manner.',
			tags: ['api', 'users'],
			plugins: { 'hapi-swagger': usersSwagger['GET /users'] },
			validate: {
				failAction,
				query: paginateValidator,
			},
		},
		handler: userController.getUsers,
	},
	{
		path: '/users/{id}',
		method: 'GET',
		options: {
			description: 'Get a single user.',
			notes: 'Gets a single user from the given user id.',
			tags: ['api', 'users'],
			plugins: { 'hapi-swagger': usersSwagger['GET /users/{id}'] },
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: userController.getUserById,
	},
	{
		path: '/users',
		method: 'POST',
		options: {
			description: 'Create new user.',
			notes: 'Creates a new user.',
			tags: ['api', 'users'],
			plugins: { 'hapi-swagger': usersSwagger['POST /users'] },
			validate: {
				failAction,
				payload: createUserValidator,
			},
		},
		handler: userController.addUser,
	},
	{
		path: '/users/{id}',
		method: 'PUT',
		options: {
			description: 'Edit an exising user.',
			notes: 'Edits an existing user from the given id.',
			tags: ['api', 'users'],
			plugins: { 'hapi-swagger': usersSwagger['PUT /users/{id}'] },
			validate: {
				failAction,
				params: idValidator,
				payload: editUserValidator,
			},
		},
		handler: userController.updateUser,
	},
	{
		path: '/users/{id}/password',
		method: 'PUT',
		options: {
			description: 'Edit an exising user password.',
			notes: 'Edits an existing user password from the given id.',
			tags: ['api', 'users'],
			plugins: { 'hapi-swagger': usersSwagger['PUT /users/{id}/password'] },
			validate: {
				failAction,
				params: idValidator,
				payload: editUserPasswordValidator,
			},
		},
		handler: userController.updateUserPassword,
	},
	{
		path: '/users/{id}',
		method: 'DELETE',
		options: {
			description: 'Delete a user.',
			notes: 'Deletes a user from the given id.',
			tags: ['api', 'users'],
			plugins: { 'hapi-swagger': usersSwagger['DELETE /users/{id}'] },
			validate: {
				failAction,
				params: idValidator,
			},
		},
		handler: userController.deleteUser,
	},
];
