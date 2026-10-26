'use strict';

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'style.css';
document.head.append(link);

const STORAGE_KEY = 'todo-tasks';

let tasks = []; 

let editingId = null;
let search = '';
let filter = 'all'; 
let sortAsc = true;
let draggedId = null; 

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    tasks = Array.isArray(saved) ? saved : [];
  } catch {
    tasks = [];
  }
}

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

const sortButton = createElement('button', 'button', 'Сортировать по дате (от старой к новой)');
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

function getVisibleTasks() {
  const query = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filter === 'done' && !task.done) return false;
    if (filter === 'active' && task.done) return false;
    return task.title.toLowerCase().includes(query);
  });

}

function isDragEnabled() {
  return filter === 'all' && search.trim() === '' && editingId === null;
}

function render() {
  list.innerHTML = '';

  const visibleTasks = getVisibleTasks();
  visibleTasks.forEach((task) => list.append(createTaskElement(task)));

  if (tasks.length === 0) {
    emptyMessage.textContent = 'Задач пока нет — добавьте первую!';
  } else if (visibleTasks.length === 0) {
    emptyMessage.textContent = 'Ничего не найдено';
  } else {
    emptyMessage.textContent = '';
  }

  const doneCount = tasks.filter((task) => task.done).length;
  counter.textContent = `Всего: ${tasks.length} /  Выполнено: ${doneCount}`;
}

function createTaskElement(task) {
  const item = createElement('li', 'task-item');
  item.dataset.id = task.id;

  if (task.id === editingId) {
    item.classList.add('task-item--editing');
    item.append(createEditForm(task));
    return item;
  }

  if (task.done) item.classList.add('task-item--done');

  const checkbox = createElement('input', 'task-item__checkbox');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.setAttribute('aria-label', 'Отметить как выполненную');
  checkbox.addEventListener('change', () => toggleTask(task.id));

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
  editButton.addEventListener('click', () => startEdit(task.id));

  const deleteButton = createElement('button', 'button button--icon button--danger', '✕');
  deleteButton.type = 'button';
  deleteButton.title = 'Удалить';
  deleteButton.setAttribute('aria-label', 'Удалить');
  deleteButton.addEventListener('click', () => deleteTask(task.id));

  actions.append(editButton, deleteButton);
  item.append(checkbox, info, actions);

  if (isDragEnabled()) {
    item.draggable = true;
    item.classList.add('task-item--draggable');
    addDragHandlers(item);
  }

  return item;
}

function createEditForm(task) {
  const editForm = createElement('form', 'task-edit');

  const editTitle = createElement('input', 'input task-edit__title');
  editTitle.type = 'text';
  editTitle.value = task.title;
  editTitle.required = true;
  editTitle.maxLength = 100;
  editTitle.setAttribute('aria-label', 'Новое название');

  const editDate = createElement('input', 'input task-edit__date');
  editDate.type = 'date';
  editDate.value = task.date;
  editDate.required = true;
  editDate.setAttribute('aria-label', 'Новая дата');

  const saveButton = createElement('button', 'button button--primary', 'Сохранить');
  saveButton.type = 'submit';

  const cancelButton = createElement('button', 'button', 'Отмена');
  cancelButton.type = 'button';
  cancelButton.addEventListener('click', () => {
    editingId = null;
    render();
  });

  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateTask(task.id, editTitle.value, editDate.value);
  });

  editForm.append(editTitle, editDate, saveButton, cancelButton);
  return editForm;
}

function addTask(title, date) {
  tasks.push({
    id: Date.now(),
    title: title,
    date: date,
    done: false,
  });
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);
  task.done = !task.done;
  saveTasks();
  render();
}

function startEdit(id) {
  editingId = id;
  render();
  list.querySelector('.task-edit__title').focus();
}

function updateTask(id, newTitle, newDate) {
  const title = newTitle.trim();
  if (!title) return;

  const task = tasks.find((task) => task.id === id);
  task.title = title;
  task.date = newDate;
  editingId = null;
  saveTasks();
  render();
}

function sortByDate() {
  tasks.sort((a, b) => {
    const difference = new Date(a.date) - new Date(b.date);
    return sortAsc ? difference : -difference;
  });
  sortAsc = !sortAsc;
  sortButton.textContent = sortAsc ? 'Сортировать по дате (от новой к старой)' : 'Сортировать по дате (от старой к новой)';
  saveTasks();
  render();
}

function addDragHandlers(item) {
  item.addEventListener('dragstart', (event) => {
    draggedId = Number(item.dataset.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.dataset.id);
    item.classList.add('task-item--dragging');
    list.classList.add('task-list--dragging');
  });

  item.addEventListener('dragend', () => {
    draggedId = null;
    item.classList.remove('task-item--dragging');
    list.classList.remove('task-list--dragging');
  });

  item.addEventListener('dragover', (event) => {
    event.preventDefault(); 
    if (Number(item.dataset.id) !== draggedId) {
      item.classList.add('task-item--over');
    }
  });

  item.addEventListener('dragleave', () => {
    item.classList.remove('task-item--over');
  });

  item.addEventListener('drop', (event) => {
    event.preventDefault();
    item.classList.remove('task-item--over');
    moveTask(draggedId, Number(item.dataset.id));
  });
}

function moveTask(fromId, toId) {
  if (fromId === null || fromId === toId) return;

  const fromIndex = tasks.findIndex((task) => task.id === fromId);
  const toIndex = tasks.findIndex((task) => task.id === toId);

  const [movedTask] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, movedTask);          

  saveTasks();
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

searchInput.addEventListener('input', () => {
  search = searchInput.value;
  render();
});

filterSelect.addEventListener('change', () => {
  filter = filterSelect.value;
  render();
});

sortButton.addEventListener('click', sortByDate);

loadTasks();
render();
