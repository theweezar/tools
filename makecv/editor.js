import Quill from 'quill';
import Handlebars from 'handlebars';

const quill = new Quill('#editor', {
  theme: 'snow'
});
const LOCAL_KEY = "quill_ct";

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function load() {
  try {
    const quillContent = localStorage.getItem(LOCAL_KEY);
    const contentJson = JSON.parse(quillContent);
    quill.setContents(contentJson);
  } catch (error) {
    console.error(error.message);
    localStorage.removeItem(LOCAL_KEY);
    alert("Failed to load content. Removed current source in storage.");
  }
}

function save() {
  try {
    const quillContent = JSON.stringify(quill.getContents());
    localStorage.setItem(LOCAL_KEY, quillContent);
    console.log('saved to storage.');
  } catch (error) {
    console.error(error.message);
  }
}

function parseAndInsertHtml() {
  const company = document.getElementById("company");
  const role = document.getElementById("role");
  const content = document.getElementById("content");
  const data = {
    company: company.value || '{{company}}',
    role: role.value || '{{role}}',
  };
  const source = quill.getSemanticHTML().replace(/&nbsp;/g, ' ');
  const template = Handlebars.compile(source);
  const result = template(data);
  content.innerHTML = result;
}

function initQuillEvents() {
  const handleQuillTextChange = debounce((delta, oldDelta, source) => {
    if (source === "user") save();
    parseAndInsertHtml();
  });
  quill.on('text-change', handleQuillTextChange);
  document.getElementById("company").addEventListener('change', parseAndInsertHtml);
  document.getElementById("role").addEventListener('change', parseAndInsertHtml);
}

function copyToClipboard() {
  const notification = document.getElementById('notification');
  const content = document.getElementById("content");
  const text = content.innerText;
  navigator.clipboard.writeText(text).then(() => {
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  });
}

initQuillEvents();
load();
document.getElementById('copyBtn').addEventListener('click', copyToClipboard);