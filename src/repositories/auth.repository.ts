import { type Login, type UserWithoutPassword, type User } from 'src/models';
import { type UUID } from 'crypto';
import { type DataStore } from 'src/store';

export const authRepository = {
	login(store: DataStore, loginData: Login) {
		const { users } = store.getState();
		const user = users.find(user => user.email === loginData.email);

		if (!user) {
			return null;
		}

		if (user.password !== loginData.password) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword as UserWithoutPassword;
	},

	register(store: DataStore, user: User) {
		let isRegistered = false;
		const { users } = store.getState();

		// Return early if the user already exists
		if (
			users.find(u => u.email === user.email || u.username === user.username)
		) {
			return isRegistered;
		}

		isRegistered = true;
		store.setState(state => ({
			...state,
			users: [user, ...state.users],
		}));

		return isRegistered;
	},

	me(store: DataStore, id: UUID) {
		const { users } = store.getState();
		const user = users.find(user => user.id === id);

		if (!user) {
			return null;
		}

		const { password, ...userWithoutPassword } = user;

		return userWithoutPassword as UserWithoutPassword;
	},
};
