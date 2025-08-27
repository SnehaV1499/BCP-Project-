class JobPortalAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.currentUser = this.loadFromStorage('user');
        this.token = this.loadFromStorage('token');
        this.mockMode = false; // Always use backend
    }

    loadFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return key === 'user' ? JSON.parse(item) : item;
        } catch {
            return null;
        }
    }

    saveToStorage(key, value) {
        try {
            const storageValue = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, storageValue);
        } catch {}
    }

    removeFromStorage(key) {
        localStorage.removeItem(key);
    }

    getHeaders(isFormData = false) {
        const headers = {};
        if (!isFormData) headers['Content-Type'] = 'application/json';
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        return headers;
    }

    async apiCall(endpoint, options = {}) {
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.body instanceof FormData),
                ...options.headers
            }
        };
        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return await response.json();
    }

    // --- AUTH METHODS ---
    async signup(name, email, password, role) {
        const data = { name, email, password, role };
        const res = await this.apiCall('/auth/signup', { 
            method: 'POST',
            body: JSON.stringify(data)
        });
        this.currentUser = res.user;
        this.token = res.token;
        this.saveToStorage('user', res.user);
        this.saveToStorage('token', res.token);
        return res;
    }

    async login(email, password) {
        const data = { email, password };
        const res = await this.apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        this.currentUser = res.user;
        this.token = res.token;
        this.saveToStorage('user', res.user);
        this.saveToStorage('token', res.token);
        return res;
    }

    async resetPassword(token, newPassword) {
        const data = { password: newPassword };
        const res = await this.apiCall(`/auth/reset-password?token=${encodeURIComponent(token)}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return res;
    }

    // --- JOB METHODS ---
    async getJobs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.apiCall(`/jobs${queryParams ? '?' + queryParams : ''}`);
    }
    async postJob(jobData) {
        return await this.apiCall('/jobs', { method: 'POST', body: JSON.stringify(jobData) });
    }
    async updateJob(jobId, jobData) {
        return await this.apiCall(`/jobs/${jobId}`, { method: 'PUT', body: JSON.stringify(jobData) });
    }
    async deleteJob(jobId) {
        return await this.apiCall(`/jobs/${jobId}`, { method: 'DELETE' });
    }
    async getJobMatches(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.apiCall(`/jobs/matches${queryParams ? '?' + queryParams : ''}`);
    }

    // --- APPLICATION METHODS ---
    async getApplications(jobId = null) {
        const endpoint = jobId ? `/applications?jobId=${jobId}` : '/applications';
        return await this.apiCall(endpoint);
    }
    async applyForJob(jobId, resumeFile, coverLetter = '') {
        const formData = new FormData();
        formData.append('jobId', jobId);
        formData.append('coverLetter', coverLetter);
        if (resumeFile) formData.append('resume', resumeFile);
        return await this.apiCall('/applications', { method: 'POST', body: formData });
    }
    async updateApplicationStatus(applicationId, status, feedback = '', interviewDate = null) {
        return await this.apiCall(`/applications/${applicationId}`, {
            method: 'PUT',
            body: JSON.stringify({ status, feedback, interviewDate })
        });
    }
    async withdrawApplication(applicationId) {
        return await this.apiCall(`/applications/${applicationId}`, { method: 'DELETE' });
    }

    // --- PROFILE METHODS ---
    async getProfile() {
        return await this.apiCall('/profile');
    }
    async updateProfile(profileData, avatarFile = null) {
        if (avatarFile) {
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
                if (Array.isArray(value)) formData.append(key, value.join(','));
                else formData.append(key, value);
            });
            formData.append('avatar', avatarFile);
            return await this.apiCall('/profile', { method: 'PUT', body: formData });
        } else {
            return await this.apiCall('/profile', { method: 'PUT', body: JSON.stringify(profileData) });
        }
    }

    // --- MESSAGE METHODS ---
    async getMessages(receiverId = null) {
        const endpoint = receiverId ? `/messages?receiverId=${receiverId}` : '/messages';
        return await this.apiCall(endpoint);
    }
    async sendMessage(receiverId, message, type = 'direct') {
        return await this.apiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId, message, type })
        });
    }

    // --- ANALYTICS & DASHBOARD METHODS ---
    async getAnalytics() {
        return await this.apiCall('/analytics');
    }
    async getDashboard() {
        return await this.apiCall('/dashboard');
    }

    // --- Utility ---
    getCurrentUser() {
        return this.currentUser;
    }
    isHR() {
        return this.currentUser?.role === 'HR' || this.currentUser?.role === 'hr';
    }
    isStudent() {
        return this.currentUser?.role === 'Student' || this.currentUser?.role === 'student';
    }
    logout() {
        this.token = null;
        this.currentUser = null;
        this.removeFromStorage('token');
        this.removeFromStorage('user');
    }
}
const api = new JobPortalAPI();
if (typeof module !== 'undefined' && module.exports) module.exports = JobPortalAPI;