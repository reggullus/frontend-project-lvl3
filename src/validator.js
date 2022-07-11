import * as yup from 'yup';
import onChange from 'on-change';

const validate = (url, feeds) => {
  const schema = yup.string().required().url().notOneOf(feeds);
  return schema.validate(url, { abortEarly: false });
};

const renderErrors = (elements, value) => {
  elements.input.classList.remove('is-invalid');
  if (value === null) return;
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.replace('text-success', 'text-danger');
  elements.feedback.textContent = value;
};

const handleProcessSubmit = (elements, value) => {
  elements.button.disabled = true;
  elements.feedback.classList.replace('text-danger', 'text-success');
  elements.feedback.textContent = 'RSS успешно загружен';
  elements.form.reset();
  elements.input.focus();
  elements.button.disabled = false;
};

const watcher = (elements) => (state) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.feeds':
      handleProcessSubmit(elements, value);
      break;

    case 'form.errors':
      renderErrors(elements, value);
      break;

    default:
      break;
  }
});

export {
  watcher,
  validate,
};
