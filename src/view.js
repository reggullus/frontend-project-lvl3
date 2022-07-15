/* global document */
/* eslint no-undef: "error" */
import onChange from 'on-change';

const renderFeeds = (elements, i18n, value) => {
  const el = elements;
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

  el.feeds.innerHTML = '';
  el.feeds.append(header, feedList);
};

const renderPosts = (elements, i18n, value) => {
  const el = elements;
  const header = document.createElement('h2');
  header.textContent = i18n.t('posts');

  const fragment = document.createDocumentFragment();

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');

  value.forEach((item) => {
    const { title, link, id } = item;

    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex');
    post.classList.add('justify-content-between', 'align-items-start', 'fw-bold');

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
    watchButton.dataset.bsToggle = 'modal';
    watchButton.dataset.bsTarget = '#modal';

    titleEl.addEventListener('click', () => {
      post.classList.remove('fw-bold');
      post.classList.add('fw-normal');
    });

    watchButton.addEventListener('click', () => {
      post.classList.remove('fw-bold');
      post.classList.add('fw-normal');
      el.title.textContent = item.title;
      el.body.textContent = item.description;
      el.redirect.href = item.link;
    });

    post.append(titleEl, watchButton);
    fragment.append(post);
  });

  el.posts.innerHTML = '';
  postsList.append(fragment);
  elements.posts.append(header, postsList);
};

const renderErrors = (elements, value) => {
  const el = elements;
  el.input.classList.remove('is-invalid');
  if (value === null) return;
  el.input.classList.add('is-invalid');
  el.feedback.classList.replace('text-success', 'text-danger');
  el.feedback.textContent = value;
};

const handleProcessSubmit = (elements, i18n) => {
  const el = elements;
  el.button.disabled = true;
  el.feedback.classList.replace('text-danger', 'text-success');
  el.feedback.textContent = i18n.t('success');
  el.form.reset();
  el.input.focus();
  el.button.disabled = false;
};

export default (elements, i18n) => (state) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.feeds':
      handleProcessSubmit(elements, i18n);
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
