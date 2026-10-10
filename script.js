const fileInput = document.querySelector('#resume-file');
const dropzone = document.querySelector('#dropzone');
const analyzeButton = document.querySelector('#analyze');
const fileStatus = document.querySelector('#file-status');
const results = document.querySelector('#results');
let selectedFile = null;
let analysisTimer;

function selectFile(file) {
  clearTimeout(analysisTimer);
  results.setAttribute('aria-busy', 'false');
  analyzeButton.innerHTML = 'Analyze my resume <span>↗</span>';
  selectedFile = null;
  analyzeButton.disabled = true;
  fileStatus.classList.remove('error');
  document.querySelector('#upload-title').textContent = 'Drop your resume here';
  document.querySelector('#upload-description').innerHTML = 'or <span class="browse">browse files</span> on your computer';
  if (!file) { fileStatus.textContent = ''; return; }
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
    fileStatus.textContent = 'Please choose a PDF file.';
    fileStatus.classList.add('error');
    fileInput.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024 || file.size === 0) {
    fileStatus.textContent = file.size === 0 ? 'This file is empty. Choose another PDF.' : 'Your PDF must be 10 MB or smaller.';
    fileStatus.classList.add('error');
    fileInput.value = '';
    return;
  }
  selectedFile = file;
  document.querySelector('#upload-title').textContent = file.name;
  document.querySelector('#upload-description').textContent = 'Ready to go · Click to choose a different PDF';
  fileStatus.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB · Selected on your device`;
  analyzeButton.disabled = false;
}

fileInput.addEventListener('change', () => selectFile(fileInput.files[0]));
['dragenter', 'dragover'].forEach(event => dropzone.addEventListener(event, e => {
  e.preventDefault();
  dropzone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach(event => dropzone.addEventListener(event, e => {
  e.preventDefault();
  dropzone.classList.remove('dragging');
}));
dropzone.addEventListener('drop', event => {
  fileInput.value = '';
  if (event.dataTransfer.files.length !== 1) {
    selectFile(null);
    fileStatus.textContent = 'Please choose one PDF at a time.';
    fileStatus.classList.add('error');
    return;
  }
  selectFile(event.dataTransfer.files[0]);
});

function showReport(name) {
  document.querySelector('#demo-badge').textContent = 'DEMO RESULTS';
  document.querySelector('#report-note').textContent = `${name} · Sample score and skills only. PDF contents are not analyzed.`;
  results.setAttribute('aria-busy', 'false');
  results.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
}

analyzeButton.addEventListener('click', () => {
  if (!selectedFile) return;
  analyzeButton.disabled = true;
  analyzeButton.textContent = 'Preparing your sample report…';
  results.setAttribute('aria-busy', 'true');
  analysisTimer = setTimeout(() => {
    showReport(selectedFile.name);
    analyzeButton.innerHTML = 'View sample analysis again <span>↗</span>';
    analyzeButton.disabled = false;
    fileStatus.textContent = 'Sample report ready. Your file remains on your device.';
  }, 900);
});

document.querySelector('#sample').addEventListener('click', () => {
  clearTimeout(analysisTimer);
  results.setAttribute('aria-busy', 'false');
  analyzeButton.innerHTML = 'Analyze my resume <span>↗</span>';
  analyzeButton.disabled = !selectedFile;
  showReport('Sample frontend developer resume');
});
