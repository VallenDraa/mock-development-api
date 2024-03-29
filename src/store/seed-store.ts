import { type UUID } from 'crypto';
import { type User, type Post, type Comment } from 'src/models';
import { type DataStore, dataStore } from '.';
import {
	createFakeComment,
	createFakeUser,
	createFakePost,
} from 'src/utils/fake-data';
import {
	emptyArray,
	getRandomFromArray,
	getRandomsFromArray,
} from 'src/utils/array-utils';
import { faker } from '@faker-js/faker';

const randInt = (min: number, max: number) => faker.number.int({ min, max });

const getRandomRepliesAmount = (
	fakeCommentRepliesLength: number,
	chosenRepliesIdx: number[],
) => {
	if (
		fakeCommentRepliesLength - 1 === 0 ||
		chosenRepliesIdx.length === fakeCommentRepliesLength
	) {
		return 0;
	}

	if (fakeCommentRepliesLength === 1) {
		return 1;
	}

	return randInt(1, fakeCommentRepliesLength);
};

export const seedStore = (
	store: DataStore,
	userAmount = 100,
	postAmount = 200,
	commentAmount = 400,
) => {
	store.setState(state => {
		const users = emptyArray<User>(userAmount).map(() => createFakeUser());

		const posts = emptyArray<Post>(postAmount).map(() =>
			createFakePost({
				ownerId: users[randInt(0, users.length - 1)].id,
				dislikes: getRandomsFromArray(users.map(user => user.id)),
				likes: getRandomsFromArray(users.map(user => user.id)),
			}),
		);

		const comments: Comment[] = [];
		for (let i = 0; i < commentAmount; i++) {
			const postId = getRandomFromArray(posts).id;

			// We make the fake replies and then push it to the new fake comment
			const fakeCommentReplies = emptyArray<UUID>(randInt(1, 5)).map(() =>
				createFakeComment({
					ownerId: getRandomFromArray(users).id,
					postId,
					replies: [],
					dislikes: getRandomsFromArray(users.map(user => user.id)),
					likes: getRandomsFromArray(users.map(user => user.id)),
				}),
			);

			const chosenRepliesIdx: number[] = [];
			const repliesAmount = getRandomRepliesAmount(
				fakeCommentReplies.length,
				chosenRepliesIdx,
			);

			const fakeComment = createFakeComment({
				ownerId: getRandomFromArray(users).id,
				postId,
				replies: emptyArray<UUID>(repliesAmount).map(() => {
					const maxRepliesAmount = fakeCommentReplies.length - 1;
					let idx = randInt(0, maxRepliesAmount);

					while (chosenRepliesIdx.includes(idx)) {
						if (chosenRepliesIdx.length === fakeCommentReplies.length) {
							break;
						}

						idx = randInt(0, maxRepliesAmount);
					}

					chosenRepliesIdx.push(idx);
					return fakeCommentReplies[idx].id;
				}),
				dislikes: getRandomsFromArray(users.map(user => user.id)),
				likes: getRandomsFromArray(users.map(user => user.id)),
			});

			comments.push(fakeComment, ...fakeCommentReplies);
		}

		return { ...state, users, posts, comments };
	});
};

export const seedStoreInit = () => {
	const { FAKE_USER_AMOUNT, FAKE_COMMENT_AMOUNT, FAKE_POST_AMOUNT } =
		process.env;

	seedStore(
		dataStore,
		parseInt(FAKE_USER_AMOUNT ?? '100', 10),
		parseInt(FAKE_COMMENT_AMOUNT ?? '100', 10),
		parseInt(FAKE_POST_AMOUNT ?? '100', 10),
	);
};
