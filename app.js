/**
 * CareerPath - Job Application Tracker
 * Core Application Logic (localStorage, CRUD, Filters, Chart.js)
 */

// --- Constants & Seed Data ---
const STORAGE_KEY = 'careerpath_applications_inr';

const SEED_DATA = [
  {
    id: 'seed-1',
    company: 'Google',
    title: 'Senior Software Engineer',
    location: 'Mountain View, CA',
    date: '2026-06-15',
    status: 'Interview Scheduled',
    salary: '₹12,00,000 - ₹15,00,000',
    interviewDate: '2026-06-25T10:00',
    link: 'https://careers.google.com',
    contactName: 'Alex Smith (Recruiter)',
    contactEmail: 'alex.smith@google.com',
    notes: 'Technical round scheduled. Focus on System Design, Data Structures, and Scalability concepts.'
  },
  {
    id: 'seed-2',
    company: 'Stripe',
    title: 'Product Designer',
    location: 'Remote',
    date: '2026-06-08',
    status: 'Offer Received',
    salary: '₹10,00,000 - ₹12,00,000',
    interviewDate: '',
    link: 'https://stripe.com/jobs',
    contactName: 'Sarah Jenkins',
    contactEmail: 'sjenkins@stripe.com',
    notes: 'Received official offer letter! Compensation package is competitive. Drafting base salary negotiation strategy.'
  },
  {
    id: 'seed-3',
    company: 'Netflix',
    title: 'Senior Frontend Developer',
    location: 'Los Gatos, CA',
    date: '2026-06-19',
    status: 'Applied',
    salary: '₹18,00,000 - ₹22,00,000',
    interviewDate: '',
    link: 'https://jobs.netflix.com',
    contactName: '',
    contactEmail: '',
    notes: 'Submitted application via employee referral. Reached out to HM on LinkedIn to express interest.'
  },
  {
    id: 'seed-4',
    company: 'Meta',
    title: 'Engineering Manager',
    location: 'Seattle, WA',
    date: '2026-05-20',
    status: 'Rejected',
    salary: '₹14,00,000 - ₹16,00,000',
    interviewDate: '',
    link: 'https://jobs.meta.com',
    contactName: '',
    contactEmail: '',
    notes: 'Responded after initial resume screening. Will follow up in 6 months to re-apply.'
  }
];

// --- State Management ---
let applications = [];
let currentEditingId = null;
let statusChartInstance = null;

// --- DOM Elements ---
const DOM = {
  // Stats Counters
  statTotal: document.getElementById('stat-count-total'),
  statInterviews: document.getElementById('stat-count-interviews'),
  statOffers: document.getElementById('stat-count-offers'),
  statRejected: document.getElementById('stat-count-rejected'),
  progressInterviews: document.getElementById('stat-progress-interviews'),
  progressOffers: document.getElementById('stat-progress-offers'),
  progressRejected: document.getElementById('stat-progress-rejected'),
  
  // Toolbar Controls
  searchInput: document.getElementById('search-input'),
  filterStatus: document.getElementById('filter-status'),
  filterLocation: document.getElementById('filter-location'),
  sortBy: document.getElementById('sort-by'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
  
  // Card Grid & Empty State
  jobsGrid: document.getElementById('jobs-grid-container'),
  emptyState: document.getElementById('empty-state'),
  applicationsCountHeading: document.getElementById('applications-count-heading'),
  
  // Add/Edit buttons
  btnAddHeader: document.getElementById('btn-add-job-header'),
  btnAddEmpty: document.getElementById('btn-add-job-empty'),
  
  // Modal Elements
  modal: document.getElementById('job-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalClose: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  form: document.getElementById('job-form'),
  
  // Form Fields
  formCompany: document.getElementById('form-company'),
  formJobTitle: document.getElementById('form-job-title'),
  formLocation: document.getElementById('form-location'),
  formSalary: document.getElementById('form-salary'),
  formDate: document.getElementById('form-date'),
  formStatus: document.getElementById('form-status'),
  interviewTimeGroup: document.getElementById('interview-time-group'),
  formInterviewDate: document.getElementById('form-interview-date'),
  formLink: document.getElementById('form-link'),
  formContactName: document.getElementById('form-contact-name'),
  formContactEmail: document.getElementById('form-contact-email'),
  formNotes: document.getElementById('form-notes')
};

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupEventListeners();
  populateLocationFilter();
  renderApp();
});

// --- Data Operations ---
function initData() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      applications = JSON.parse(localData);
    } catch (e) {
      console.error('Error parsing localStorage data, resetting to seed data.', e);
      applications = [...SEED_DATA];
      saveToStorage();
    }
  } else {
    // If empty storage, seed it
    applications = [...SEED_DATA];
    saveToStorage();
  }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Modal triggers
  DOM.btnAddHeader.addEventListener('click', () => openModal());
  DOM.btnAddEmpty.addEventListener('click', () => openModal());
  DOM.modalClose.addEventListener('click', closeModal);
  DOM.btnCancelModal.addEventListener('click', closeModal);
  
  // Modal overlay click closure
  DOM.modal.addEventListener('click', (e) => {
    if (e.target === DOM.modal) closeModal();
  });
  
  // Form submission
  DOM.form.addEventListener('submit', handleFormSubmit);
  
  // Interactive Conditional Status Field: show interview details if 'Interview Scheduled' selected
  DOM.formStatus.addEventListener('change', (e) => {
    toggleInterviewDateField(e.target.value);
  });
  
  // Live filters and search
  DOM.searchInput.addEventListener('input', renderApp);
  DOM.filterStatus.addEventListener('change', renderApp);
  DOM.filterLocation.addEventListener('change', renderApp);
  DOM.sortBy.addEventListener('change', renderApp);
  
  // Reset filters
  DOM.btnClearFilters.addEventListener('click', clearFilters);
}

// --- Modal Helper Functions ---
function openModal(editingId = null) {
  // Reset errors
  document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
  
  if (editingId) {
    currentEditingId = editingId;
    DOM.modalTitle.textContent = 'Edit Job Application';
    
    const app = applications.find(a => a.id === editingId);
    if (app) {
      DOM.formCompany.value = app.company;
      DOM.formJobTitle.value = app.title;
      DOM.formLocation.value = app.location || '';
      DOM.formSalary.value = app.salary || '';
      DOM.formDate.value = app.date;
      DOM.formStatus.value = app.status;
      DOM.formInterviewDate.value = app.interviewDate || '';
      DOM.formLink.value = app.link || '';
      DOM.formContactName.value = app.contactName || '';
      DOM.formContactEmail.value = app.contactEmail || '';
      DOM.formNotes.value = app.notes || '';
      
      toggleInterviewDateField(app.status);
    }
  } else {
    currentEditingId = null;
    DOM.modalTitle.textContent = 'Add Job Application';
    DOM.form.reset();
    
    // Set default application date to today
    const today = new Date().toISOString().split('T')[0];
    DOM.formDate.value = today;
    
    toggleInterviewDateField('Applied');
  }
  
  DOM.modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeModal() {
  DOM.modal.classList.remove('active');
  document.body.style.overflow = ''; // Restore scroll
  DOM.form.reset();
}

function toggleInterviewDateField(status) {
  if (status === 'Interview Scheduled') {
    DOM.interviewTimeGroup.style.display = 'block';
  } else {
    DOM.interviewTimeGroup.style.display = 'none';
    DOM.formInterviewDate.value = ''; // Reset when hidden
  }
}

// --- Filters & Sort Handlers ---
function clearFilters() {
  DOM.searchInput.value = '';
  DOM.filterStatus.value = 'all';
  DOM.filterLocation.value = 'all';
  DOM.sortBy.value = 'date-desc';
  renderApp();
}

function populateLocationFilter() {
  const currentVal = DOM.filterLocation.value;
  
  // Extract unique locations, filter out empty values, sort alphabetically
  const locations = [...new Set(applications.map(app => app.location?.trim()))]
    .filter(loc => loc)
    .sort();
    
  // Keep first default option
  DOM.filterLocation.innerHTML = '<option value="all">All Locations</option>';
  
  locations.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc;
    DOM.filterLocation.appendChild(opt);
  });
  
  // Retain selection if it still exists
  if (locations.includes(currentVal)) {
    DOM.filterLocation.value = currentVal;
  } else {
    DOM.filterLocation.value = 'all';
  }
}

// --- Parsing Helper for Sorting ---
function extractSalaryValue(salaryStr) {
  if (!salaryStr) return 0;
  // Remove non-digit characters except dashes/periods (e.g., "₹12L" -> "12")
  // Handle ranges like ₹12,00,000 - ₹14,00,000 by taking the average or the higher end.
  // Let's strip spaces, commas, dollar and rupee signs.
  const cleaned = salaryStr.replace(/[₹$,\s]/g, '');
  const parts = cleaned.split('-');
  
  if (parts.length > 0) {
    // Check if numbers exist in parts
    let primaryVal = parts[parts.length - 1]; // Use higher value in range
    // If it has 'k', multiply by 1000
    let multiplier = 1;
    if (primaryVal.toLowerCase().includes('k')) {
      multiplier = 1000;
      primaryVal = primaryVal.toLowerCase().replace('k', '');
    }
    const val = parseFloat(primaryVal);
    return isNaN(val) ? 0 : val * multiplier;
  }
  return 0;
}

// --- Data Filtering and Sorting Engine ---
function getFilteredApplications() {
  const query = DOM.searchInput.value.toLowerCase().trim();
  const statusFilter = DOM.filterStatus.value;
  const locationFilter = DOM.filterLocation.value;
  const sortCriteria = DOM.sortBy.value;
  
  // 1. Filter
  let filtered = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(query) || 
                          app.title.toLowerCase().includes(query);
                          
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    const matchesLocation = locationFilter === 'all' || app.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });
  
  // 2. Sort
  filtered.sort((a, b) => {
    switch (sortCriteria) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'salary-desc':
        return extractSalaryValue(b.salary) - extractSalaryValue(a.salary);
      case 'company-asc':
        return a.company.localeCompare(b.company);
      case 'jobtitle-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  return filtered;
}

// --- Form Validation & Submission ---
function handleFormSubmit(e) {
  e.preventDefault();
  
  if (validateForm()) {
    const jobData = {
      id: currentEditingId || 'job-' + Date.now(),
      company: DOM.formCompany.value.trim(),
      title: DOM.formJobTitle.value.trim(),
      location: DOM.formLocation.value.trim(),
      salary: DOM.formSalary.value.trim(),
      date: DOM.formDate.value,
      status: DOM.formStatus.value,
      interviewDate: DOM.formInterviewDate.value,
      link: DOM.formLink.value.trim(),
      contactName: DOM.formContactName.value.trim(),
      contactEmail: DOM.formContactEmail.value.trim(),
      notes: DOM.formNotes.value.trim()
    };
    
    if (currentEditingId) {
      // Update
      const index = applications.findIndex(a => a.id === currentEditingId);
      if (index !== -1) {
        applications[index] = jobData;
      }
    } else {
      // Add new
      applications.unshift(jobData);
    }
    
    saveToStorage();
    populateLocationFilter();
    closeModal();
    renderApp();
  }
}

function validateForm() {
  let isValid = true;
  
  // Reset all validation errors
  document.querySelectorAll('.form-group').forEach(group => group.classList.remove('has-error'));
  
  // 1. Company Name Required
  if (!DOM.formCompany.value.trim()) {
    DOM.formCompany.closest('.form-group').classList.add('has-error');
    isValid = false;
  }
  
  // 2. Job Title Required
  if (!DOM.formJobTitle.value.trim()) {
    DOM.formJobTitle.closest('.form-group').classList.add('has-error');
    isValid = false;
  }
  
  // 3. Date Required
  if (!DOM.formDate.value) {
    DOM.formDate.closest('.form-group').classList.add('has-error');
    isValid = false;
  }
  
  // 4. Job Link URL format check (if provided)
  const linkVal = DOM.formLink.value.trim();
  if (linkVal) {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(linkVal)) {
      DOM.formLink.closest('.form-group').classList.add('has-error');
      isValid = false;
    } else {
      // Prepend https:// if not present
      if (!/^https?:\/\//i.test(linkVal)) {
        DOM.formLink.value = 'https://' + linkVal;
      }
    }
  }
  
  // 5. Contact Email format check (if provided)
  const emailVal = DOM.formContactEmail.value.trim();
  if (emailVal) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailVal)) {
      DOM.formContactEmail.closest('.form-group').classList.add('has-error');
      isValid = false;
    }
  }
  
  return isValid;
}

// --- CRUD Actions: Delete & Edit ---
function deleteApplication(id) {
  if (confirm('Are you sure you want to delete this job application?')) {
    applications = applications.filter(app => app.id !== id);
    saveToStorage();
    populateLocationFilter();
    renderApp();
  }
}

// --- Render Engine ---
function renderApp() {
  const filteredApps = getFilteredApplications();
  
  // Update Stats Counters
  updateStats();
  
  // Render Chart
  renderChart();
  
  // Render Cards Grid
  renderGrid(filteredApps);
}

function updateStats() {
  const total = applications.length;
  const interviews = applications.filter(app => app.status === 'Interview Scheduled').length;
  const offers = applications.filter(app => app.status === 'Offer Received').length;
  const rejected = applications.filter(app => app.status === 'Rejected').length;
  
  // Update numbers
  DOM.statTotal.textContent = total;
  DOM.statInterviews.textContent = interviews;
  DOM.statOffers.textContent = offers;
  DOM.statRejected.textContent = rejected;
  
  // Update progress bars (percent of total applications)
  const percentInterviews = total > 0 ? (interviews / total) * 100 : 0;
  const percentOffers = total > 0 ? (offers / total) * 100 : 0;
  const percentRejected = total > 0 ? (rejected / total) * 100 : 0;
  
  DOM.progressInterviews.style.width = `${percentInterviews}%`;
  DOM.progressOffers.style.width = `${percentOffers}%`;
  DOM.progressRejected.style.width = `${percentRejected}%`;
}

function renderChart() {
  const ctx = document.getElementById('status-chart').getContext('2d');
  
  // Count current statuses
  const counts = {
    'Applied': 0,
    'Interview Scheduled': 0,
    'Offer Received': 0,
    'Rejected': 0
  };
  
  applications.forEach(app => {
    if (counts.hasOwnProperty(app.status)) {
      counts[app.status]++;
    }
  });
  
  const chartData = [
    counts['Applied'],
    counts['Interview Scheduled'],
    counts['Offer Received'],
    counts['Rejected']
  ];
  
  // Colors mapped to status variables
  const backgroundColors = [
    '#6366f1', // Applied (Indigo)
    '#d97706', // Interview Scheduled (Amber)
    '#059669', // Offer Received (Emerald)
    '#e11d48'  // Rejected (Rose)
  ];
  
  // If chart already exists, update and redial
  if (statusChartInstance) {
    statusChartInstance.data.datasets[0].data = chartData;
    statusChartInstance.update();
    return;
  }
  
  // Create new chart instance
  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
      datasets: [{
        data: chartData,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              family: 'Inter',
              size: 11,
              weight: '500'
            },
            color: '#334155',
            boxWidth: 12,
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return ` ${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

function renderGrid(apps) {
  // Clear the existing cards
  DOM.jobsGrid.innerHTML = '';
  
  // Update count heading text
  DOM.applicationsCountHeading.textContent = `Applications (${apps.length})`;
  
  if (apps.length === 0) {
    DOM.jobsGrid.style.display = 'none';
    DOM.emptyState.style.display = 'flex';
  } else {
    DOM.jobsGrid.style.display = 'grid';
    DOM.emptyState.style.display = 'none';
    
    // Create card fragments
    apps.forEach(app => {
      const card = createJobCard(app);
      DOM.jobsGrid.appendChild(card);
    });
  }
}

function createJobCard(app) {
  const card = document.createElement('article');
  card.className = 'job-card';
  card.setAttribute('aria-label', `${app.title} at ${app.company}`);
  
  // Determine status class name
  let statusClass = 'status-applied';
  if (app.status === 'Interview Scheduled') statusClass = 'status-interview';
  if (app.status === 'Offer Received') statusClass = 'status-offer';
  if (app.status === 'Rejected') statusClass = 'status-rejected';
  
  // First initial of company for logo visual
  const companyInitial = app.company.charAt(0);
  
  // Format Date (YYYY-MM-DD -> Dec 15, 2026 or similar localized date)
  let formattedDate = app.date;
  try {
    const parts = app.date.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (err) {
    console.error('Date parsing error', err);
  }
  
  // Formatted Interview Date/Time
  let interviewHTML = '';
  if (app.status === 'Interview Scheduled' && app.interviewDate) {
    try {
      const intDate = new Date(app.interviewDate);
      const formattedIntDate = intDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      interviewHTML = `
        <div class="interview-notice">
          <i class="fa-solid fa-clock"></i>
          <span>Interview: ${formattedIntDate}</span>
        </div>
      `;
    } catch (e) {
      console.error(e);
    }
  }
  
  // Contact details block
  let contactHTML = '';
  if (app.contactName || app.contactEmail) {
    contactHTML = `
      <div class="job-card-contact">
        <span class="contact-header">Point of Contact</span>
        ${app.contactName ? `<span class="contact-name"><i class="fa-solid fa-user-tie"></i> ${app.contactName}</span>` : ''}
        ${app.contactEmail ? `<a href="mailto:${app.contactEmail}" class="contact-email"><i class="fa-solid fa-envelope"></i> ${app.contactEmail}</a>` : ''}
      </div>
    `;
  }
  
  // Notes block
  const notesHTML = app.notes ? `<div class="job-card-notes">"${app.notes}"</div>` : '';
  
  // Main card layout construction
  card.innerHTML = `
    <div class="job-card-header">
      <div class="company-badge">${companyInitial}</div>
      <span class="status-badge ${statusClass}">${app.status}</span>
    </div>
    
    <div class="job-card-title">
      <h3>${app.title}</h3>
      <p>${app.company}</p>
    </div>
    
    <div class="job-card-meta">
      ${app.location ? `
        <div class="meta-item">
          <i class="fa-solid fa-location-dot"></i>
          <span>${app.location}</span>
        </div>
      ` : ''}
      <div class="meta-item">
        <i class="fa-solid fa-calendar-days"></i>
        <span>Applied ${formattedDate}</span>
      </div>
      ${app.salary ? `
        <div class="meta-item">
          <i class="fa-solid fa-indian-rupee-sign"></i>
          <span>${app.salary}</span>
        </div>
      ` : ''}
    </div>
    
    ${interviewHTML}
    ${contactHTML}
    ${notesHTML}
    
    <div class="job-card-footer">
      ${app.link ? `
        <a href="${app.link}" target="_blank" rel="noopener noreferrer" class="job-link-btn">
          View Post <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      ` : '<span></span>'}
      
      <div class="job-actions">
        <button class="btn-icon btn-edit" title="Edit Application" data-id="${app.id}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-delete" title="Delete Application" data-id="${app.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  // Attach event listeners to card action buttons
  card.querySelector('.btn-edit').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(app.id);
  });
  
  card.querySelector('.btn-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteApplication(app.id);
  });
  
  return card;
}