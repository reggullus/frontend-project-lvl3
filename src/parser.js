const getPosts = (data) => {
  const items = data.querySelectorAll('channel > item');
  const posts = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const post = { title, description, link };
    return post;
  });
  return posts;
};

const getFeed = (data) => {
  const title = data.querySelector('channel > title').textContent;
  const description = data.querySelector('channel > description').textContent;
  const feed = { title, description };
  return feed;
};

export default (rss) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rss, 'text/xml');
  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    throw new Error(parserError);
  }

  const feed = getFeed(doc);
  const posts = getPosts(doc);
  return { feed, posts };
};
