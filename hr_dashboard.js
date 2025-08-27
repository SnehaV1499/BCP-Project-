let currentUser = null;
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
    const dashboard = await api.getDashboard();
    document.getElementById('totalJobs').textContent = dashboard.stats.totalJobs;
    document.getElementById('totalApplicants').textContent = dashboard.stats.totalApplicants;
    document.getElementById('avgMatch').textContent = dashboard.stats.avgMatch;
    document.getElementById('pendingReviews').textContent = dashboard.stats.pendingReviews;
    renderRecentApplications(dashboard.recentApplications || []);
  } catch (e) {
    showNotification('Failed to load dashboard: ' + e.message, 'error');
  }
}
function renderRecentApplications(apps) {
  const container = document.getElementById('jobApplications');
  container.innerHTML = '';
  apps.forEach(app => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <div class="job-title">${app.jobId?.title || '-'}</div>
      <div class="job-details">${app.applicantName || '-'} • ${app.status}</div>
      <div class="job-details">${formatDate(app.appliedAt)}</div>
    `;
    container.appendChild(div);
  });
}

// ========== Post Job ==========
async function postJob(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const jobData = {};
  formData.forEach((v, k) => jobData[k] = v);
  if (jobData.skills) jobData.skills = jobData.skills.split(',').map(s => s.trim()).filter(Boolean);
  try {
    if (window.editingJobId) {
      await api.updateJob(window.editingJobId, jobData);
      showNotification('Job updated successfully!', 'success');
      window.editingJobId = null;
    } else {
      await api.postJob(jobData);
      showNotification('Job posted successfully!', 'success');
    }
    form.reset();
    await loadJobs();
  } catch (e) {
    showNotification('Failed to post/update job: ' + e.message, 'error');
  }
}

// ========== Jobs Table ==========
async function loadJobs() {
  try {
    const jobs = await api.getJobs();
    const tbody = document.getElementById('myJobsTable');
    tbody.innerHTML = '';
    (jobs || []).forEach(job => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${job.title}</td>
        <td>${job.location}</td>
        <td>${job.applicantsCount || 0}</td>
        <td>${job.status}</td>
        <td>
          <button class="btn btn-info btn-small" onclick="viewJob('${job._id}')">View</button>
          <button class="btn btn-primary btn-small" onclick="editJob('${job._id}')">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteJob('${job._id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (e) {
    showNotification('Failed to fetch jobs: ' + e.message, 'error');
  }
}
async function deleteJob(jobId) {
  if (!confirm("Delete this job?")) return;
  try {
    await api.deleteJob(jobId);
    showNotification("Job deleted!", "success");
    await loadJobs();
  } catch (e) {
    showNotification("Failed to delete job: " + e.message, "error");
  }
}

// ========== Job Modal ==========
function showJobModal(job) {
  let modal = document.getElementById('jobDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'jobDetailModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="document.getElementById('jobDetailModal').style.display='none'">&times;</span>
        <h2 id="modalJobTitle"></h2>
        <p><strong>Description:</strong> <span id="modalJobDescription"></span></p>
        <p><strong>Location:</strong> <span id="modalJobLocation"></span></p>
        <p><strong>Skills:</strong> <span id="modalJobSkills"></span></p>
        <p><strong>Type:</strong> <span id="modalJobType"></span></p>
        <p><strong>Salary:</strong> <span id="modalJobSalary"></span></p>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('modalJobTitle').textContent = job.title || '-';
  document.getElementById('modalJobDescription').textContent = job.description || '-';
  document.getElementById('modalJobLocation').textContent = job.location || '-';
  document.getElementById('modalJobSkills').textContent = (job.skills || []).join(', ');
  document.getElementById('modalJobType').textContent = job.type || '-';
  document.getElementById('modalJobSalary').textContent = job.salary || '-';
  modal.style.display = 'block';
}

// ========== View Job ==========
async function viewJob(jobId) {
  try {
    const jobs = await api.getJobs({ _id: jobId });
    const job = Array.isArray(jobs) ? jobs[0] : jobs;
    showJobModal(job);
  } catch (e) {
    showNotification('Failed to fetch job details: ' + e.message, 'error');
  }
}

// ========== Edit Job ==========
async function editJob(jobId) {
  try {
    const jobs = await api.getJobs({ _id: jobId });
    const job = Array.isArray(jobs) ? jobs[0] : jobs;
    const form = document.getElementById('jobForm');
    form.title.value = job.title || '';
    form.description.value = job.description || '';
    form.location.value = job.location || '';
    form.skills.value = (job.skills || []).join(', ');
    form.type.value = job.type || '';
    form.salary.value = job.salary || '';
    window.editingJobId = jobId;
    showSection('hr-postjob', '.sidebar');
    showNotification('Edit the job details and click "Post Job" to save.', 'info');
  } catch (e) {
    showNotification('Failed to load job for editing: ' + e.message, 'error');
  }
}

// ========== Analytics ==========
async function loadAnalytics() {
  try {
    const analytics = await api.getAnalytics();
    document.getElementById('mostPopularJob').textContent = analytics.mostPopularJob || '-';
    document.getElementById('highestApplications').textContent = analytics.highestApplications || '-';
    document.getElementById('bestMatchRate').textContent = analytics.bestMatchRate || '-';
    if (analytics.applicationsByJob) renderBarChart(analytics.applicationsByJob);
  } catch (e) {
    showNotification('Failed to load analytics: ' + e.message, 'error');
  }
}
function renderBarChart(data) {
  const ctx = document.getElementById('jobBarChart').getContext('2d');
  if (window._barChart) window._barChart.destroy();
  window._barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(x => x.title),
      datasets: [{
        label: 'Applications',
        data: data.map(x => x.count),
        backgroundColor: '#3498db'
      }]
    },
    options: { responsive: true }
  });
}
function exportCSV() { showNotification("Export Applicants CSV (not implemented)", "info"); }
function exportJobsCSV() { showNotification("Export Jobs CSV (not implemented)", "info"); }
function generateReport() { showNotification("Generate Report (not implemented)", "info"); }

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
    setTimeout(() => {
      const responses = [
        "Let me check on that for you.",
        "Thanks for your message, we'll get back soon.",
        "HR team will connect shortly."
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
  document.getElementById('profileDepartment').value = profile.department || '';
  document.getElementById('profileBio').value = profile.bio || '';
  document.getElementById('profileSkills').value = (profile.skills || []).join(', ');
  const firstName = (profile.name || 'HR').split(' ')[0];
  document.getElementById('sidebarName').textContent = `Hi, ${firstName}!`;
  document.getElementById('sidebarRole').textContent = profile.department || profile.role || 'Department';
  updateSkillsDisplay(profile.skills || []);
  experiences = profile.experience || [];
  updateExperienceDisplay();
}
async function saveProfile() {
  const skillsValue = document.getElementById('profileSkills').value;
  const profileData = {
    name: document.getElementById('profileName').value,
    email: document.getElementById('profileEmail').value,
    phone: document.getElementById('profilePhone').value,
    department: document.getElementById('profileDepartment').value,
    bio: document.getElementById('profileBio').value,
    skills: skillsValue ? skillsValue.split(',').map(s => s.trim()) : [],
    experience: experiences
  };
  try {
    showNotification('Saving profile...', 'info');
    const avatarFile = document.getElementById('avatarInput').files[0];
    await api.updateProfile(profileData, avatarFile);
    currentUser = { ...currentUser, ...profileData };
    document.getElementById('sidebarName').textContent = `Hi, ${(profileData.name || 'HR').split(' ')[0]}!`;
    document.getElementById('sidebarRole').textContent = profileData.department;
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
  const duration = prompt("Duration (e.g. Jan 2024 - Aug 2024):");
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

// ========== Profile Modal ==========
function openProfileModal() {
  document.getElementById('profileModal').style.display = 'block';
  document.getElementById('modalName').value = currentUser.name || '';
}
function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}
async function saveModalProfile() {
  const newName = document.getElementById('modalName').value.trim();
  if (newName) {
    try {
      await api.updateProfile({ name: newName });
      currentUser.name = newName;
      document.getElementById('sidebarName').textContent = `Hi, ${newName.split(' ')[0]}!`;
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
function previewProfile() {
  showNotification('Opening profile preview...', 'info');
}
function changePassword() {
  showNotification('Password change feature will be implemented soon', 'info');
}

// ========== Section Data Loading ==========
async function loadSectionData(sectionId) {
  switch (sectionId) {
    case 'hr-dashboard':
      await loadDashboard();
      break;
    case 'hr-postjob':
      await loadJobs();
      break;
    case 'hr-analytics':
      await loadAnalytics();
      break;
    case 'hr-messages':
      await loadMessages();
      break;
    case 'hr-profile':
      await loadProfile();
      break;
  }
}

// ========== Utility ==========
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
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
  try {
    await loadProfile();
    await loadDashboard();
    await loadJobs();
    await loadAnalytics();
  } catch (e) {
    showNotification('Some features may not work properly', 'warning');
  }
  window.addEventListener('click', function (event) {
    const modal = document.getElementById('profileModal');
    if (event.target === modal) closeProfileModal();
  });
  const chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.addEventListener('keypress', handleChatKeyPress);
});