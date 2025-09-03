const input = document.querySelector('#task-input');
const addBtn = document.querySelector('#add-btn');
const listEl = document.querySelector('#list');
const countEl = document.querySelector('#count');
const clearBtn = document.querySelector('#clear-completed');
const filterBtns = document.querySelectorAll('.filter');

const STORAGE_KEY = 'vanilla_todos_v2';

let state = {
  todos: loadTodos(),
  filter: 'all'
};

render();

// --- Events ---
addBtn.addEventListener('click', addFromInput);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addFromInput();
});

clearBtn.addEventListener('click', () => {
  state.todos = state.todos.filter(t => !t.completed);
  persist();
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.filter = btn.dataset.filter;
    render();
  });
});

// --- Functions ---
function addFromInput() {
  const text = input.value.trim();
  if (!text) return;
  state.todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false
  });
  input.value = '';
  persist();
  render();
}

function toggleTodo(id) {
  const t = state.todos.find(t => t.id === id);
  if (t) t.completed = !t.completed;
  persist();
  render();
}

function deleteTodo(id) {
  state.todos = state.todos.filter(t => t.id !== id);
  persist();
  render();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function filteredTodos() {
  if (state.filter === 'active') return state.todos.filter(t => !t.completed);
  if (state.filter === 'completed') return state.todos.filter(t => t.completed);
  return state.todos;
}

function render() {
  listEl.innerHTML = filteredTodos()
    .map(t => itemTemplate(t))
    .join('');

  document.querySelectorAll('.toggle').forEach(cb => {
    cb.addEventListener('change', () => toggleTodo(cb.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteTodo(btn.dataset.id));
  });

  const activeCount = state.todos.filter(t => !t.completed).length;
  countEl.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'}`;
}

function itemTemplate(t) {
  return `
    <li class="item ${t.completed ? 'completed' : ''}">
      <input class="toggle" type="checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''} />
      <label>${escapeHTML(t.text)}</label>
      <button class="delete-btn" data-id="${t.id}">✕</button>
    </li>
  `;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}
