// @flow
/*
 * API to scrape data from a Discourse forum.
 */

import fetch from "isomorphic-fetch";

/**
 * Scrape data from a Discourse to fetch all users
 *
 * @param {String} discourse
 *    name of discourse server;
 * @return {Promise<object>}
 *    a promise that resolves to a JSON object containing the users data
 *    scraped from the disourse
 */
export function fetchUsers(
  discourse: string
): Promise<any> {
	return fetch(`https://discuss.${discourse}.io/directory_items.json?period=all`)
	.then((response) => {
		if (response.status >= 400) {
			throw new Error("Bad response from server");
		}
		return response.json();
	})
	.then((users) => {
		return users;
	});
}

/**
 * Scrape data from a Discourse to fetch all categories
 *
 * @param {String} discourse
 *    name of discourse server;
 * @return {Promise<object>}
 *    a promise that resolves to a JSON object containing the categories data
 *    scraped from the disourse
 */
export function fetchCategories(
  discourse: string
): Promise<any> {
	return fetch(`https://discuss.${discourse}.io/categories.json`)
	.then((response) => {
		if (response.status >= 400) {
			throw new Error("Bad response from server");
		}
		return response.json();
	})
	.then((categories) => {
		return categories;
	});
}

/**
 * Scrape data from a Discourse to fetch a specific topic
 *
 * @param {String} discourse
 *    name of discourse server;
 * @param {String} id
 *    id of the topic
 * @return {Promise<object>}
 *    a promise that resolves to a JSON object containing the topic data
 *    scraped from the disourse
 */
export function fetchTopic(
  discourse: string,
  id: string
): Promise<any> {
	return fetch(`https://discuss.${discourse}.io/c/${id}.json`)
	.then((response) => {
		if (response.status >= 400) {
			throw new Error("Bad response from server");
		}
		return response.json();
	})
	.then((topic) => {
		return topic;
	});
}

/**
 * Scrape data from a Discourse to fetch a specific post
 *
 * @param {String} discourse
 *    name of discourse server;
 * @param {String} id
 *    id of the post
 * @return {Promise<object>}
 *    a promise that resolves to a JSON object containing the post data
 *    scraped from the disourse
 */
export function fetchPost(
  discourse: string,
  id: string
): Promise<any> {
	return fetch(`https://discuss.${discourse}.io/t/${id}.json`)
	.then((response) => {
		if (response.status >= 400) {
			throw new Error("Bad response from server");
		}
		return response.json();
	})
	.then((post) => {
		return post;
	});
}
