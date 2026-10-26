'use strict';

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'style.css';
document.head.append(link);

let tasks = [
  { id: 1, title: 'Пример: сделать лабу', date: '2026-10-25', done: false },
  { id: 2, title: 'Пример: купить хлеб', date: '2026-10-22', done: true },
];

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatDate(isoDate) {
  if (!isoDate) return 'без даты';
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

const header = createElement('header', 'header');
const pageTitle = createElement('h1', 'header__title', 'Мой ToDo-лист');
header.append(pageTitle);

const main = createElement('main', 'main');

const addSection = createElement('section', 'add-section');
const form = createElement('form', 'task-form');

const titleInput = createElement('input', 'input task-form__title');
titleInput.type = 'text';
titleInput.placeholder = 'Что нужно сделать?';
titleInput.required = true;
titleInput.maxLength = 100;
titleInput.setAttribute('aria-label', 'Название задачи');

const dateInput = createElement('input', 'input task-form__date');
dateInput.type = 'date';
dateInput.required = true;
dateInput.setAttribute('aria-label', 'Дата задачи');

const addButton = createElement('button', 'button button--primary', 'Добавить');
addButton.type = 'submit';

form.append(titleInput, dateInput, addButton);
addSection.append(form);

const controls = createElement('section', 'controls');

const searchInput = createElement('input', 'input controls__search');
searchInput.type = 'search';
searchInput.placeholder = 'Поиск по названию';
searchInput.setAttribute('aria-label', 'Поиск по названию');

const filterSelect = createElement('select', 'input controls__filter');
filterSelect.setAttribute('aria-label', 'Фильтр по статусу');
const filterOptions = [
  ['all', 'Все задачи'],
  ['active', 'Невыполненные'],
  ['done', 'Выполненные'],
];
filterOptions.forEach(([value, text]) => {
  const option = createElement('option', '', text);
  option.value = value;
  filterSelect.append(option);
});

const sortButton = createElement('button', 'button', 'Сортировать по дате ↑');
sortButton.type = 'button';

controls.append(searchInput, filterSelect, sortButton);

// список задач
const tasksSection = createElement('section', 'tasks-section');
const list = createElement('ul', 'task-list');
const emptyMessage = createElement('p', 'empty-message');
const dragHint = createElement('p', 'drag-hint');
tasksSection.append(list, emptyMessage, dragHint);

main.append(addSection, controls, tasksSection);

const footer = createElement('footer', 'footer');
const counter = createElement('p', 'footer__counter');
footer.append(counter);

document.body.append(header, main, footer);

function render() {
  list.innerHTML = '';

  tasks.forEach((task) => list.append(createTaskElement(task)));

  emptyMessage.textContent = tasks.length === 0 ? 'Задач пока нет — добавьте первую!' : '';

  const doneCount = tasks.filter((task) => task.done).length;
  counter.textContent = `Всего: ${tasks.length} · Выполнено: ${doneCount}`;
}

function createTaskElement(task) {
  const item = createElement('li', 'task-item');
  item.dataset.id = task.id;

  const checkbox = createElement('input', 'task-item__checkbox');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.setAttribute('aria-label', 'Отметить как выполненную');

  const info = createElement('div', 'task-item__info');
  const titleElement = createElement('span', 'task-item__title', task.title);
  const dateElement = createElement('time', 'task-item__date', formatDate(task.date));
  dateElement.dateTime = task.date;
  info.append(titleElement, dateElement);

  const actions = createElement('div', 'task-item__actions');

  const editButton = createElement('button', 'button button--icon', '✎');
  editButton.type = 'button';
  editButton.title = 'Редактировать';
  editButton.setAttribute('aria-label', 'Редактировать');

  const deleteButton = createElement('button', 'button button--icon button--danger', '✕');
  deleteButton.type = 'button';
  deleteButton.title = 'Удалить';
  deleteButton.setAttribute('aria-label', 'Удалить');

  actions.append(editButton, deleteButton);
  item.append(checkbox, info, actions);

  return item;
}

function addTask(title, date) {
  tasks.push({
    id: Date.now(),
    title: title,
    date: date,
    done: false,
  });
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  addTask(title, dateInput.value);
  form.reset();
  titleInput.focus();
});

render();