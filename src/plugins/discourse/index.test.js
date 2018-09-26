// @flow

import { 
	fetchUsers, 
	fetchCategories, 
	fetchTopics, 
	fetchPosts
} from './fetchDiscourseData.js';

describe("Fetching Discourse data", () => {
	test('should pull data', async () => {

		const discourse = "sourcecred"

		console.log(await fetchUsers(discourse));
		console.log(await fetchCategories(discourse));

		const testCategory = 1;
		console.log(await fetchTopic(discourse, testCategory));
		
		const testTopic = 8;
		console.log(await fetchPost(discourse, testTopic));

	});
});