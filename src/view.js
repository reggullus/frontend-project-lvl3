import onChange from 'on-change';

const renderFeeds = (elements, i18n, value) => {
  const header = document.createElement('h2');
  header.textContent = i18n.t('feeds');

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'mb-5');

  value.forEach((item) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item');

    const feedHeader = document.createElement('h3');
    feedHeader.textContent = item.title;

    const feedDescription = document.createElement('p');
    feedDescription.textContent = item.description;

    feed.append(feedHeader, feedDescription);
    feedList.prepend(feed);
  });

  elements.feeds.innerHTML = '';
  elements.feeds.append(header, feedList);
};

const renderPosts = (elements, i18n, value) => {
  const header = document.createElement('h2');
  header.textContent = i18n.t('posts');

  const fragment = document.createDocumentFragment();

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');

  value.forEach((item) => {
    const { title, link, id } = item;

    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex');
    post.classList.add('justify-content-between', 'align-items-start');

    const titleEl = document.createElement('a');
    titleEl.textContent = title;
    titleEl.classList.add('font-weight');
    titleEl.setAttribute('href', link);
    titleEl.setAttribute('target', '_blank');
    titleEl.setAttribute('rel', 'noopener noreferrer');

    const watchButton = document.createElement('button');
    watchButton.textContent = i18n.t('inspect');
    watchButton.classList.add('btn', 'btn-primary', 'btn-sm');
    watchButton.setAttribute('type', 'button');
    watchButton.dataset.id = id;
    watchButton.dataset.toggle = 'modal';
    watchButton.dataset.target = '#modal';

    watchButton.addEventListener('click', () => {
      elements.title.textContent = item.title;
      elements.body.textContent = item.description;
      elements.redirect.href = item.link;
    });

    post.append(titleEl, watchButton);
    fragment.append(post);
  });

  elements.posts.innerHTML = '';
  postsList.append(fragment);
  elements.posts.append(header, postsList);
};

const renderErrors = (elements, value) => {
  elements.input.classList.remove('is-invalid');
  if (value === null) return;
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.replace('text-success', 'text-danger');
  elements.feedback.textContent = value;
};

const handleProcessSubmit = (elements, i18n, value) => {
  elements.button.disabled = true;
  elements.feedback.classList.replace('text-danger', 'text-success');
  elements.feedback.textContent = i18n.t('success');
  elements.form.reset();
  elements.input.focus();
  elements.button.disabled = false;
};

export default (elements, i18n) => (state) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.feeds':
      handleProcessSubmit(elements, i18n, value);
      break;

    case 'form.errors':
      renderErrors(elements, value);
      break;

    case 'feeds':
      renderFeeds(elements, i18n, value);
      break;

    case 'posts':
      renderPosts(elements, i18n, value);
      break;

    default:
      break;
  }
});
