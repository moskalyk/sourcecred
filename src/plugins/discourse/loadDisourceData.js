// @flow

import fs from "fs-extra";
import path from "path";
import pako from "pako";

import { 
  fetchUsers, 
  fetchCategories, 
  fetchTopic, 
  fetchPost
} from './fetchDiscourseData.js';

export type Options = {|
  +outputDirectory: string,
|};

export async function loadDisourceData(options: Options): Promise<void> {

  // Fetch all Users
  const users = await fetchUsers();

  // Fetch all Categories
  const categories = await fetchCategories();
  for(category in categories) {

    // Fetch All Topics in the categories
    const topics = []; // get topics category
    for(topic in topics) {
      const topicId = topic;
      const topic = await fetchTopic(topicId);

      const posts = [] // get posts
      // Fetch all topic
      for(post in posts) {

      }
    }
  }

  // Fetch All Posts in a Topic
  const blob: Uint8Array = pako.gzip(JSON.stringify(view));
  const outputFilename = path.join(options.outputDirectory, "disource.json.gz");
  return fs.writeFile(outputFilename, blob);
}
