// All code is dynamic, no hardcoded user/app/job data

let currentUser = null;
let applications = [];
let experiences = [];

// ========== Notification ==========
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}

// ========== Tab Switching ==========
function showSection(sectionId, sidebarClass, event) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  document.getElementById(sectionId).style.display = 'block';
  document.querySelectorAll(`${sidebarClass} a`).forEach(link => link.classList.remove('active'));
  if (event) event.target.classList.add('active');
  loadSectionData(sectionId);
}

// ========== Dashboard ==========
async function loadDashboard() {
  try {
    const dashboardResponse = await api.getDashboard();
    document.getElementById('appliedCount').textContent = dashboardResponse.stats.appliedCount;
    document.getElementById('interviewCount').textContent = dashboardResponse.stats.interviewCount;
    document.getElementById('savedCount').textContent = dashboardResponse.stats.savedCount;
    document.getElementById('responseRate').textContent = dashboardResponse.stats.responseRate + '%';
    renderRecentActivity(dashboardResponse.recentApplications || []);
  } catch (e) {
    showNotification('Failed to load dashboard: ' + e.message, 'error');
  }
}
function renderRecentActivity(apps) {
  const container = document.getElementById('recentActivity');
  container.innerHTML = '';
  apps.forEach(app => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <div class="job-title">${app.jobId?.title || 'Job'}</div>
      <div class="job-details">Status: ${app.status} • ${formatDate(app.appliedAt)}</div>
      <div class="job-actions">
        <button class="btn btn-primary btn-small" onclick="viewApplicationDetails('${app._id}')">View Details</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ========== Jobs ==========
async function searchJobs() {
  const keywords = document.getElementById('searchKeywords').value;
  const location = document.getElementById('locationFilter').value;
  const type = document.getElementById('typeFilter').value;
  try {
    showNotification('Searching for jobs...', 'info');
    const filters = {};
    if (keywords) filters.keywords = keywords;
    if (location) filters.location = location;
    if (type) filters.type = type;
    const jobs = await api.getJobMatches(filters);
    renderJobList(jobs);
    showNotification('Search completed!', 'success');
  } catch (e) {
    showNotification('Search failed: ' + e.message, 'error');
  }
}
function renderJobList(jobs) {
  const container = document.getElementById('jobList');
  container.innerHTML = '';
  jobs.forEach(job => {
    const matchColor = job.matchScore >= 80 ? '#27ae60' : job.matchScore >= 60 ? '#f39c12' : '#e74c3c';
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.innerHTML = `
      <div class="job-title">${job.title}</div>
      <div class="job-details">
        <strong>Company:</strong> ${job.postedBy?.name || 'Company'}<br>
        <strong>Location:</strong> ${job.location || ''}<br>
        <strong>Type:</strong> ${job.type}<br>
        <strong>Skills:</strong> ${job.skills || ''}<br>
        <strong>Salary:</strong> ${job.salary || ''}<br>
        <strong>Match:</strong> <span style="color: ${matchColor}; font-weight: bold;">${job.matchScore}%</span>
      </div>
      <div class="job-actions">
        <input type="file" id="cv-${job._id}" accept=".pdf,.doc,.docx" style="display: none;">
        <button class="btn btn-primary btn-small" onclick="document.getElementById('cv-${job._id}').click()">📎 Upload CV & Apply</button>
        <button class="btn btn-warning btn-small" onclick="saveJob('${job._id}')">💾 Save Job</button>
        <button class="btn btn-success btn-small" onclick="viewJobDetails('${job._id}')">👁️ View Details</button>
      </div>
    `;
    container.appendChild(jobCard);
    document.getElementById(`cv-${job._id}`).addEventListener('change', function (e) {
      if (e.target.files[0]) applyForJob(job._id, e.target.files[0]);
    });
  });
}
async function applyForJob(jobId, resumeFile) {
  if (!resumeFile || resumeFile.size > 5 * 1024 * 1024) {
    showNotification('Please select a valid CV file (max 5MB)', 'error');
    return;
  }
  try {
    showNotification('Uploading CV and submitting application...', 'info');
    const coverLetter = prompt('Add a cover letter (optional):') || '';
    await api.applyForJob(jobId, resumeFile, coverLetter);
    showNotification('Application submitted successfully!', 'success');
    await Promise.all([loadApplications(), loadDashboard()]);
  } catch (e) {
    showNotification('Application failed: ' + e.message, 'error');
  }
}
function saveJob(jobId) {
  showNotification('Job saved! (Feature will be fully implemented)', 'success');
}
function viewJobDetails(jobId) {
  showNotification('Opening job details... (Feature will be fully implemented)', 'info');
}

// ========== Applications ==========
async function loadApplications() {
  try {
    applications = await api.getApplications();
    updateApplicationsTable();
    // Stats
    let total = applications.length, review = 0, interviews = 0, offers = 0;
    applications.forEach(app => {
      if (app.status === 'Under Review') review++;
      if (app.status === 'Interview Scheduled') interviews++;
      if (app.status === 'Offer Received' || app.status === 'Accepted') offers++;
    });
    document.getElementById('appStatTotal').textContent = total;
    document.getElementById('appStatReview').textContent = review;
    document.getElementById('appStatInterviews').textContent = interviews;
    document.getElementById('appStatOffers').textContent = offers;
  } catch (e) {
    showNotification('Failed to load applications: ' + e.message, 'error');
  }
}
function updateApplicationsTable() {
  const tbody = document.getElementById('myApplicationsTable');
  tbody.innerHTML = '';
  applications.forEach(app => {
    const statusClass = getStatusClass(app.status);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${app.jobId?.title || 'Job Title'}</td>
      <td>${app.jobId?.postedBy?.name || 'Company'}</td>
      <td>${formatDate(app.appliedAt)}</td>
      <td><span class="btn ${statusClass} btn-small">${app.status}</span></td>
      <td>
        <button class="btn btn-primary btn-small" onclick="viewApplicationDetails('${app._id}')">View Details</button>
        ${getApplicationActions(app)}
      </td>
    `;
    tbody.appendChild(row);
  });
}
function getStatusClass(status) {
  const statusMap = {
    'Applied': 'btn-primary',
    'Under Review': 'btn-warning',
    'Interview Scheduled': 'btn-success',
    'Offer Received': 'btn-success',
    'Rejected': 'btn-danger',
    'Accepted': 'btn-success',
    'Withdrawn': 'btn-secondary'
  };
  return statusMap[status] || 'btn-primary';
}
function getApplicationActions(app) {
  switch (app.status) {
    case 'Interview Scheduled':
      return `<button class="btn btn-warning btn-small" onclick="prepareInterview('${app._id}')">Interview Prep</button>`;
    case 'Offer Received':
      return `<button class="btn btn-success btn-small" onclick="acceptOffer('${app._id}')">Accept Offer</button>`;
    case 'Rejected':
      return `<button class="btn btn-warning btn-small" onclick="viewFeedback('${app._id}')">View Feedback</button>`;
    case 'Applied':
    case 'Under Review':
      return `<button class="btn btn-danger btn-small" onclick="withdrawApplication('${app._id}')">Withdraw</button>`;
    default:
      return '';
  }
}
async function withdrawApplication(appId) {
  if (confirm('Are you sure you want to withdraw this application?')) {
    try {
      await api.withdrawApplication(appId);
      showNotification('Application withdrawn successfully', 'success');
      await Promise.all([loadApplications(), loadDashboard()]);
    } catch (error) {
      showNotification('Failed to withdraw application: ' + error.message, 'error');
    }
  }
}

// ========== Profile ==========
async function loadProfile() {
  try {
    const profile = await api.getProfile();
    currentUser = profile;
    populateProfileForm(profile);
  } catch (e) {
    showNotification('Failed to load profile: ' + e.message, 'error');
  }
}
function populateProfileForm(profile) {
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profileEmail').value = profile.email || '';
  document.getElementById('profilePhone').value = profile.phone || '';
  document.getElementById('profileCourse').value = profile.course || '';
  document.getElementById('profileUniversity').value = profile.university || '';
  document.getElementById('profileGradYear').value = profile.gradYear || '';
  document.getElementById('profileSkills').value = (profile.skills || []).join(', ');
  document.getElementById('profileBio').value = profile.bio || '';
  // Set sidebar
  document.getElementById('sidebarName').textContent = profile.name || 'Student';
  document.getElementById('sidebarRole').textContent = profile.course || 'Major';
  // Skills display
  updateSkillsDisplay(profile.skills || []);
  // Experience display
  experiences = profile.experience || [];
  updateExperienceDisplay();
}
async function saveProfile() {
  const skillsValue = document.getElementById('profileSkills').value;
  const profileData = {
    name: document.getElementById('profileName').value,
    email: document.getElementById('profileEmail').value,
    phone: document.getElementById('profilePhone').value,
    course: document.getElementById('profileCourse').value,
    university: document.getElementById('profileUniversity').value,
    gradYear: document.getElementById('profileGradYear').value,
    skills: skillsValue ? skillsValue.split(',').map(s => s.trim()) : [],
    bio: document.getElementById('profileBio').value,
    experience: experiences
  };
  try {
    showNotification('Saving profile...', 'info');
    const avatarFile = document.getElementById('avatarInput').files[0];
    await api.updateProfile(profileData, avatarFile);
    currentUser = { ...currentUser, ...profileData };
    document.getElementById('sidebarName').textContent = profileData.name;
    document.getElementById('sidebarRole').textContent = profileData.course;
    updateSkillsDisplay(profileData.skills);
    showNotification('Profile saved successfully!', 'success');
  } catch (e) {
    showNotification('Failed to save profile: ' + e.message, 'error');
  }
}

// ========== Skills ==========
function updateSkillsDisplay(skills = []) {
  const skillsList = document.getElementById('skillsList');
  if (!skillsList) return;
  skillsList.innerHTML = '';
  skills.forEach((skill, index) => {
    const skillTag = document.createElement('span');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `${skill} <span onclick="removeSkill(${index})" style="cursor: pointer; margin-left: 5px;">&times;</span>`;
    skillsList.appendChild(skillTag);
  });
}
function addSkill() {
  const newSkillInput = document.getElementById('newSkill');
  const newSkill = newSkillInput.value.trim();
  if (newSkill && !currentUser.skills?.includes(newSkill)) {
    currentUser.skills = currentUser.skills || [];
    currentUser.skills.push(newSkill);
    newSkillInput.value = '';
    updateSkillsDisplay(currentUser.skills);
    document.getElementById('profileSkills').value = currentUser.skills.join(', ');
    showNotification('Skill added successfully!', 'success');
  } else if (currentUser.skills?.includes(newSkill)) {
    showNotification('Skill already exists!', 'error');
  }
}
function removeSkill(index) {
  if (currentUser.skills && currentUser.skills[index]) {
    currentUser.skills.splice(index, 1);
    updateSkillsDisplay(currentUser.skills);
    document.getElementById('profileSkills').value = currentUser.skills.join(', ');
    showNotification('Skill removed!', 'success');
  }
}

// ========== Experience ==========
function updateExperienceDisplay() {
  const expList = document.getElementById('experienceList');
  expList.innerHTML = '';
  (experiences || []).forEach((exp, idx) => {
    const div = document.createElement('div');
    div.className = 'experience-item';
    div.innerHTML = `
      <h4>${exp.title}</h4>
      <p><strong>Company:</strong> ${exp.company} | <strong>Duration:</strong> ${exp.duration}</p>
      <p>${exp.description}</p>
      <button class="btn btn-danger btn-small" onclick="removeExperience(${idx})">Remove</button>
    `;
    expList.appendChild(div);
  });
}
function addExperience() {
  const title = prompt("Role/Project Title:");
  if (!title) return;
  const company = prompt("Company/Org:");
  if (!company) return;
  const duration = prompt("Duration (e.g. Jun 2024 - Aug 2024):");
  if (!duration) return;
  const description = prompt("Description:");
  if (!description) return;
  experiences.push({ title, company, duration, description });
  updateExperienceDisplay();
}
function removeExperience(idx) {
  experiences.splice(idx, 1);
  updateExperienceDisplay();
}

// ========== Messages ==========
async function loadMessages() {
  try {
    const messages = await api.getMessages();
    renderMessages(messages);
  } catch (e) {
    showNotification('Failed to load messages: ' + e.message, 'error');
  }
}
function renderMessages(messages) {
  const container = document.getElementById('chatMessages');
  container.innerHTML = '';
  messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${msg.senderId._id === currentUser._id ? 'sent' : 'received'}`;
    messageDiv.textContent = msg.message;
    container.appendChild(messageDiv);
  });
  container.scrollTop = container.scrollHeight;
}
async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  try {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message sent';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    await api.sendMessage(null, message, 'system');
    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "Thank you for your message! How can I help you with your job search?",
        "That's a great question! Let me provide some guidance on that.",
        "I understand your concern. Here are some suggestions to help you.",
        "Great progress! Keep up the excellent work on your applications."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const responseDiv = document.createElement('div');
      responseDiv.className = 'chat-message received';
      responseDiv.textContent = randomResponse;
      chatMessages.appendChild(responseDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1500);
  } catch (e) {
    showNotification('Failed to send message: ' + e.message, 'error');
  }
}
function handleChatKeyPress(event) {
  if (event.key === 'Enter') sendChatMessage();
}

// ========== Profile Modal ==========
function openProfileModal() {
  document.getElementById('profileModal').style.display = 'block';
  document.getElementById('modalName').value = currentUser.name || '';
  document.getElementById('modalStatus').value = currentUser.status || 'Looking for opportunities';
}
function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}
async function saveModalProfile() {
  const newName = document.getElementById('modalName').value.trim();
  const newStatus = document.getElementById('modalStatus').value;
  if (newName) {
    try {
      await api.updateProfile({ name: newName, status: newStatus });
      currentUser.name = newName;
      currentUser.status = newStatus;
      document.getElementById('sidebarName').textContent = newName;
      document.getElementById('profileName').value = newName;
      closeProfileModal();
      showNotification('Profile updated successfully!', 'success');
    } catch (e) {
      showNotification('Failed to update profile: ' + e.message, 'error');
    }
  }
}
function updateAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showNotification('File size should be less than 5MB', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const imageUrl = e.target.result;
    document.getElementById('profileAvatar').style.backgroundImage = `url(${imageUrl})`;
    document.getElementById('profileAvatar').textContent = '';
    document.getElementById('sidebarAvatar').style.backgroundImage = `url(${imageUrl})`;
    document.getElementById('sidebarAvatar').textContent = '';
    if (document.getElementById('modalAvatar')) {
      document.getElementById('modalAvatar').style.backgroundImage = `url(${imageUrl})`;
      document.getElementById('modalAvatar').textContent = '';
    }
    showNotification('Profile photo will be updated when you save your profile', 'info');
  };
  reader.readAsDataURL(file);
}
function updateModalAvatar(event) {
  updateAvatar(event);
}

// ========== Section Data Loading ==========
async function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'student-dashboard':
      await loadDashboard();
      break;
    case 'student-browse':
      try {
        const jobs = await api.getJobMatches();
        renderJobList(jobs);
      } catch (e) { }
      break;
    case 'student-applications':
      await loadApplications();
      break;
    case 'student-messages':
      await loadMessages();
      break;
    case 'student-profile':
      await loadProfile();
      break;
  }
}

// ========== Utility ==========
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
}
function previewProfile() {
  showNotification('Opening profile preview...', 'info');
}
function changePassword() {
  showNotification('Password change feature will be implemented soon', 'info');
}
function prepareInterview(appId) {
  showNotification('Opening interview preparation resources...', 'info');
}
function acceptOffer(appId) {
  if (confirm('Are you sure you want to accept this job offer?'))
    showNotification('Congratulations! Feature will be fully implemented soon.', 'success');
}
function viewFeedback(appId) {
  showNotification('Showing employer feedback...', 'info');
}
function viewApplicationDetails(appId) {
  showNotification('Viewing application details...', 'info');
}

// ========== Logout ==========
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logout();
    window.location.href = 'login.html';
  }
}

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', async function () {
  // Set grad year options
  let gradSelect = document.getElementById('profileGradYear');
  if (gradSelect && gradSelect.options.length < 2) {
    let thisYear = new Date().getFullYear();
    for (let y = thisYear; y <= thisYear + 5; ++y) {
      let opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      gradSelect.appendChild(opt);
    }
  }
  // Load initial user/profile
  try {
    await loadProfile();
    await Promise.all([loadDashboard(), loadApplications()]);
    const jobs = await api.getJobMatches();
    renderJobList(jobs);
  } catch (e) {
    showNotification('Some features may not work properly', 'warning');
  }
  // Listen for modal close
  window.addEventListener('click', function (event) {
    const modal = document.getElementById('profileModal');
    if (event.target === modal) closeProfileModal();
  });
  // Chat input enter key
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.addEventListener('keypress', handleChatKeyPress);
});