import Joi from 'joi';
import {
	type UserCreate,
	type User,
	type UserEdit,
	type UpdateUserPassword,
} from 'src/models';

export const createUserValidator = Joi.object<UserCreate, true>({
	profilePicture: Joi.string().trim().required().messages({
		'any.required': 'Profile picture is invalid or missing',
	}),
	username: Joi.string().trim().required().messages({
		'any.required': 'Username is invalid or missing',
	}),
	email: Joi.string().trim().required().messages({
		'any.required': 'Email is invalid or missing',
	}),
	password: Joi.string().trim().required().messages({
		'any.required': 'Password is invalid or missing',
	}),
});

export const editUserValidator = Joi.object<UserEdit, true>({
	profilePicture: Joi.string().trim().required().messages({
		'any.required': 'Profile picture is invalid or missing',
	}),
	username: Joi.string().trim().required().messages({
		'any.required': 'Username is invalid or missing',
	}),
	email: Joi.string().trim().required().messages({
		'any.required': 'Email is invalid or missing',
	}),
});

export const editUserPasswordValidator = Joi.object<UpdateUserPassword, true>({
	oldPassword: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'Old password is invalid or missing' }),
	newPassword: Joi.string()
		.trim()
		.required()
		.messages({ 'any.required': 'New password is invalid or missing' }),
});

export const userValidator = createUserValidator.append<User>({
	id: Joi.string()
		.trim()
		.uuid()
		.required()
		.messages({ 'any.required': 'UUID is invalid or missing' }),
});
