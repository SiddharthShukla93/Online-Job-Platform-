const STORAGE_KEYS = {
  users: "ojp_users",
  currentUser: "ojp_current_user",
  profiles: "ojp_profiles",
  savedJobs: "ojp_saved_jobs",
  employerJobs: "ojp_employer_jobs"
};

const defaultJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "PixelForge",
    location: "Remote",
    type: "Full-time",
    salary: "$55k - $72k",
    skills: ["HTML", "CSS", "JavaScript"]
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "CraftNest",
    location: "Bangalore",
    type: "Part-time",
    salary: "$30k - $45k",
    skills: ["Figma", "Wireframes", "Prototyping"]
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "DataMingle",
    location: "Hyderabad",
    type: "Full-time",
    salary: "$62k - $80k",
    skills: ["Node.js", "API", "MongoDB"]
  },
  {
    id: 4,
    title: "Digital Marketing Associate",
    company: "GrowthPilot",
    location: "Remote",
    type: "Internship",
    salary: "$12k - $20k",
    skills: ["SEO", "Campaigns", "Analytics"]
  },
  {
    id: 5,
    title: "QA Tester",
    company: "AssureFlow",
    location: "Pune",
    type: "Contract",
    salary: "$28k - $40k",
    skills: ["Testing", "Bug Tracking", "Automation"]
  },
  {
    id: 6,
    title: "Junior Data Analyst",
    company: "InsightArc",
    location: "Delhi",
    type: "Full-time",
    salary: "$38k - $52k",
    skills: ["Excel", "SQL", "Dashboards"]
  }
];

const ui = {
  navButtons: document.querySelectorAll(".nav-btn"),
  views: document.querySelectorAll(".view"),
  tabButtons: document.querySelectorAll(".tab-btn"),
  registerForm: document.getElementById("register-form"),
  loginForm: document.getElementById("login-form"),
  regRole: document.getElementById("reg-role"),
  loginRole: document.getElementById("login-role"),
  profileForm: document.getElementById("profile-form"),
  profileSummary: document.getElementById("profile-summary"),
  profileGuard: document.getElementById("profile-guard"),
  employerGuard: document.getElementById("employer-guard"),
  employerForm: document.getElementById("employer-form"),
  employerFormTitle: document.getElementById("employer-form-title"),
  employerJobsList: document.getElementById("employer-jobs-list"),
  jobEditId: document.getElementById("job-edit-id"),
  jobCancelEdit: document.getElementById("job-cancel-edit"),
  logoutBtn: document.getElementById("logout-btn"),
  sessionText: document.getElementById("session-text"),
  jobsGrid: document.getElementById("jobs-grid"),
  stats: document.getElementById("job-stats"),
  searchInput: document.getElementById("search-input"),
  locationFilter: document.getElementById("location-filter"),
  typeFilter: document.getElementById("type-filter"),
  clearFiltersBtn: document.getElementById("clear-filters"),
  toast: document.getElementById("toast")
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function toast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  setTimeout(() => ui.toast.classList.remove("show"), 1800);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeRole(role) {
  return role === "employer" ? "employer" : "seeker";
}

function getCurrentUser() {
  return readJSON(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
  writeJSON(STORAGE_KEYS.currentUser, user);
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function isEmployerUser() {
  return getCurrentUser()?.role === "employer";
}

function isSeekerUser() {
  return getCurrentUser()?.role === "seeker";
}

function switchView(viewName) {
  if (viewName === "profile" && !isSeekerUser()) {
    toast("Login as Job Seeker to access profile");
    viewName = "auth";
  }

  if (viewName === "employer" && !isEmployerUser()) {
    toast("Login as Employer to access employer panel");
    viewName = "auth";
  }

  ui.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  ui.views.forEach((view) => {
    view.classList.toggle("active", view.id === `view-${viewName}`);
  });
}

function switchTab(tabName) {
  ui.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  const showRegister = tabName === "register";
  ui.registerForm.classList.toggle("hidden", !showRegister);
  ui.loginForm.classList.toggle("hidden", showRegister);
}

function updateAccessPanels() {
  const seeker = isSeekerUser();
  const employer = isEmployerUser();

  ui.profileGuard.classList.toggle("hidden", seeker);
  ui.profileForm.classList.toggle("hidden", !seeker);
  ui.profileSummary.classList.toggle("hidden", !seeker);

  ui.employerGuard.classList.toggle("hidden", employer);
  ui.employerForm.classList.toggle("hidden", !employer);
  ui.employerJobsList.closest(".card").classList.toggle("hidden", !employer);
}

function renderSessionInfo() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    ui.sessionText.textContent = "Not logged in";
    ui.logoutBtn.classList.add("hidden");
    return;
  }

  const roleLabel = currentUser.role === "employer" ? "Employer" : "Job Seeker";
  ui.sessionText.textContent = `Signed in: ${currentUser.name} (${roleLabel})`;
  ui.logoutBtn.classList.remove("hidden");
}

function registerUser(event) {
  event.preventDefault();
  const formData = new FormData(ui.registerForm);
  const role = normalizeRole(formData.get("role"));
  const name = formData.get("name").trim();
  const email = formData.get("email").trim().toLowerCase();
  const password = formData.get("password").trim();

  const users = readJSON(STORAGE_KEYS.users, []);
  const exists = users.some((user) => user.email === email && user.role === role);

  if (exists) {
    toast("Email already registered for this role. Please login.");
    switchTab("login");
    ui.loginRole.value = role;
    return;
  }

  users.push({ name, email, password, role });
  writeJSON(STORAGE_KEYS.users, users);
  setCurrentUser({ name, email, role });

  toast("Registration successful");
  ui.registerForm.reset();
  ui.regRole.value = "seeker";
  loadProfileIntoForm();
  updateAccessPanels();
  renderSessionInfo();
  switchView(role === "employer" ? "employer" : "jobs");
}

function loginUser(event) {
  event.preventDefault();
  const formData = new FormData(ui.loginForm);
  const role = normalizeRole(formData.get("role"));
  const email = formData.get("email").trim().toLowerCase();
  const password = formData.get("password").trim();

  const users = readJSON(STORAGE_KEYS.users, []);
  const user = users.find(
    (item) => item.email === email && item.password === password && item.role === role
  );

  if (!user) {
    toast("Invalid credentials for selected role");
    return;
  }

  setCurrentUser({ name: user.name, email: user.email, role: user.role });
  ui.loginForm.reset();
  ui.loginRole.value = "seeker";
  loadProfileIntoForm();
  updateAccessPanels();
  renderSessionInfo();
  renderEmployerJobs();
  toast("Login successful");
  switchView(user.role === "employer" ? "employer" : "jobs");
}

function saveProfile(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "seeker") {
    toast("Only Job Seeker accounts can save profiles");
    return;
  }

  const profile = {
    name: ui.profileForm.name.value.trim(),
    email: ui.profileForm.email.value.trim().toLowerCase(),
    skills: ui.profileForm.skills.value.trim(),
    about: ui.profileForm.about.value.trim()
  };

  const profiles = readJSON(STORAGE_KEYS.profiles, {});
  profiles[currentUser.email] = profile;
  writeJSON(STORAGE_KEYS.profiles, profiles);
  setCurrentUser({ name: profile.name, email: profile.email, role: "seeker" });
  renderProfileSummary(profile);
  toast("Profile saved");
}

function renderProfileSummary(profile) {
  if (!profile || !profile.name || !profile.email) {
    ui.profileSummary.innerHTML = "<h3>Profile Summary</h3><p class='muted'>No profile saved yet.</p>";
    return;
  }

  ui.profileSummary.innerHTML = `
    <h3>Profile Summary</h3>
    <p><strong>Name:</strong> ${escapeHTML(profile.name)}</p>
    <p><strong>Email:</strong> ${escapeHTML(profile.email)}</p>
    <p><strong>Skills:</strong> ${escapeHTML(profile.skills || "Not specified")}</p>
    <p><strong>About:</strong> ${escapeHTML(profile.about || "No summary provided")}</p>
  `;
}

function loadProfileIntoForm() {
  const currentUser = getCurrentUser();
  const profiles = readJSON(STORAGE_KEYS.profiles, {});
  const savedProfile = currentUser && currentUser.email ? profiles[currentUser.email] : null;

  if (savedProfile) {
    ui.profileForm.name.value = savedProfile.name || "";
    ui.profileForm.email.value = savedProfile.email || "";
    ui.profileForm.skills.value = savedProfile.skills || "";
    ui.profileForm.about.value = savedProfile.about || "";
    renderProfileSummary(savedProfile);
    return;
  }

  if (currentUser) {
    ui.profileForm.name.value = currentUser.name || "";
    ui.profileForm.email.value = currentUser.email || "";
    ui.profileForm.skills.value = "";
    ui.profileForm.about.value = "";
    renderProfileSummary(currentUser);
    return;
  }

  ui.profileForm.reset();
  renderProfileSummary(null);
}

function getSavedJobs() {
  return readJSON(STORAGE_KEYS.savedJobs, []);
}

function getEmployerJobs() {
  return readJSON(STORAGE_KEYS.employerJobs, []);
}

function saveEmployerJobs(jobList) {
  writeJSON(STORAGE_KEYS.employerJobs, jobList);
}

function getAllJobs() {
  return [...defaultJobs, ...getEmployerJobs()];
}

function toggleSaveJob(jobId) {
  const saved = getSavedJobs();
  const exists = saved.includes(jobId);

  const updated = exists ? saved.filter((id) => id !== jobId) : [...saved, jobId];
  writeJSON(STORAGE_KEYS.savedJobs, updated);
  renderJobs();
  toast(exists ? "Job removed from saved" : "Job saved");
}

function applyForJob(title) {
  toast(`Application started for ${title}`);
}

function getFilteredJobs() {
  const query = ui.searchInput.value.trim().toLowerCase();
  const location = ui.locationFilter.value;
  const type = ui.typeFilter.value;
  const jobs = getAllJobs();

  return jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase();
    const byQuery = !query || searchable.includes(query);
    const byLocation = location === "all" || job.location === location;
    const byType = type === "all" || job.type === type;
    return byQuery && byLocation && byType;
  });
}

function renderJobs() {
  const filteredJobs = getFilteredJobs();
  const saved = getSavedJobs();

  ui.stats.textContent = `${filteredJobs.length} job${filteredJobs.length === 1 ? "" : "s"} found`;

  if (!filteredJobs.length) {
    ui.jobsGrid.innerHTML = "<p class='muted'>No jobs match your filter. Try different keywords.</p>";
    return;
  }

  ui.jobsGrid.innerHTML = filteredJobs
    .map((job) => {
      const isSaved = saved.includes(job.id);
      return `
        <article class="job-card">
          <div class="job-top">
            <div>
              <h3>${escapeHTML(job.title)}</h3>
              <p class="job-company">${escapeHTML(job.company)}</p>
            </div>
            <span class="badge">${escapeHTML(job.salary)}</span>
          </div>
          <div class="badges">
            <span class="badge">${escapeHTML(job.location)}</span>
            <span class="badge">${escapeHTML(job.type)}</span>
          </div>
          <div class="badges">
            ${job.skills.map((skill) => `<span class="badge">${escapeHTML(skill)}</span>`).join("")}
          </div>
          <div class="job-actions">
            <button class="apply-btn" data-apply="${escapeHTML(job.title)}">Apply</button>
            <button class="save-btn" data-save="${job.id}">${isSaved ? "Saved" : "Save"}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function populateFilterOptions() {
  const jobs = getAllJobs();
  const locations = [...new Set(jobs.map((job) => job.location))];
  const types = [...new Set(jobs.map((job) => job.type))];

  ui.locationFilter.innerHTML = "<option value='all'>All Locations</option>";
  ui.typeFilter.innerHTML = "<option value='all'>All Types</option>";

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    ui.locationFilter.append(option);
  });

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    ui.typeFilter.append(option);
  });
}

function clearFilters() {
  ui.searchInput.value = "";
  ui.locationFilter.value = "all";
  ui.typeFilter.value = "all";
  renderJobs();
}

function resetEmployerForm() {
  ui.employerForm.reset();
  ui.employerFormTitle.textContent = "Post a New Job";
  ui.jobEditId.value = "";
}

function renderEmployerJobs() {
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "employer") {
    ui.employerJobsList.innerHTML = "";
    resetEmployerForm();
    return;
  }

  const myJobs = getEmployerJobs().filter((job) => job.ownerEmail === currentUser.email);

  if (!myJobs.length) {
    ui.employerJobsList.innerHTML = "<p class='muted'>No jobs posted yet. Use the form to add your first job.</p>";
    return;
  }

  ui.employerJobsList.innerHTML = myJobs
    .map(
      (job) => `
      <article class="job-card">
        <div class="job-top">
          <div>
            <h3>${escapeHTML(job.title)}</h3>
            <p class="job-company">${escapeHTML(job.company)}</p>
          </div>
          <span class="badge">${escapeHTML(job.salary)}</span>
        </div>
        <div class="badges">
          <span class="badge">${escapeHTML(job.location)}</span>
          <span class="badge">${escapeHTML(job.type)}</span>
        </div>
        <div class="job-actions">
          <button class="apply-btn" data-edit-job="${job.id}">Edit</button>
          <button class="save-btn" data-delete-job="${job.id}">Delete</button>
        </div>
      </article>
    `
    )
    .join("");
}

function saveEmployerJob(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "employer") {
    toast("Only Employer accounts can post jobs");
    return;
  }

  const formData = new FormData(ui.employerForm);
  const editId = Number(formData.get("editId"));
  const skills = formData
    .get("skills")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const jobPayload = {
    title: formData.get("title").trim(),
    company: formData.get("company").trim(),
    location: formData.get("location").trim(),
    type: formData.get("type").trim(),
    salary: formData.get("salary").trim(),
    skills,
    ownerEmail: currentUser.email
  };

  const employerJobs = getEmployerJobs();

  if (editId) {
    const updated = employerJobs.map((job) => {
      if (job.id === editId && job.ownerEmail === currentUser.email) {
        return { ...job, ...jobPayload, id: editId };
      }
      return job;
    });
    saveEmployerJobs(updated);
    toast("Job updated");
  } else {
    const allJobIds = getAllJobs().map((job) => job.id);
    const nextId = (Math.max(...allJobIds, 0) || 0) + 1;
    saveEmployerJobs([...employerJobs, { ...jobPayload, id: nextId }]);
    toast("Job posted");
  }

  resetEmployerForm();
  populateFilterOptions();
  renderJobs();
  renderEmployerJobs();
}

function startEditEmployerJob(jobId) {
  const currentUser = getCurrentUser();
  const targetJob = getEmployerJobs().find(
    (job) => job.id === jobId && currentUser && job.ownerEmail === currentUser.email
  );

  if (!targetJob) {
    toast("Job not found");
    return;
  }

  ui.jobEditId.value = String(targetJob.id);
  ui.employerForm.title.value = targetJob.title;
  ui.employerForm.company.value = targetJob.company;
  ui.employerForm.location.value = targetJob.location;
  ui.employerForm.type.value = targetJob.type;
  ui.employerForm.salary.value = targetJob.salary;
  ui.employerForm.skills.value = targetJob.skills.join(", ");
  ui.employerFormTitle.textContent = "Edit Job";
}

function deleteEmployerJob(jobId) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "employer") {
    return;
  }

  const filtered = getEmployerJobs().filter(
    (job) => !(job.id === jobId && job.ownerEmail === currentUser.email)
  );
  saveEmployerJobs(filtered);

  const savedJobs = getSavedJobs().filter((id) => id !== jobId);
  writeJSON(STORAGE_KEYS.savedJobs, savedJobs);

  if (Number(ui.jobEditId.value) === jobId) {
    resetEmployerForm();
  }

  populateFilterOptions();
  renderJobs();
  renderEmployerJobs();
  toast("Job deleted");
}

function logoutUser() {
  clearCurrentUser();
  ui.loginForm.reset();
  ui.registerForm.reset();
  ui.regRole.value = "seeker";
  ui.loginRole.value = "seeker";
  resetEmployerForm();
  loadProfileIntoForm();
  renderEmployerJobs();
  updateAccessPanels();
  renderSessionInfo();
  switchView("auth");
  toast("Logged out successfully");
}

function bindEvents() {
  ui.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  ui.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  ui.registerForm.addEventListener("submit", registerUser);
  ui.loginForm.addEventListener("submit", loginUser);
  ui.profileForm.addEventListener("submit", saveProfile);
  ui.employerForm.addEventListener("submit", saveEmployerJob);
  ui.jobCancelEdit.addEventListener("click", resetEmployerForm);
  ui.logoutBtn.addEventListener("click", logoutUser);

  ui.searchInput.addEventListener("input", renderJobs);
  ui.locationFilter.addEventListener("change", renderJobs);
  ui.typeFilter.addEventListener("change", renderJobs);
  ui.clearFiltersBtn.addEventListener("click", clearFilters);

  ui.jobsGrid.addEventListener("click", (event) => {
    const applyTarget = event.target.closest("[data-apply]");
    const saveTarget = event.target.closest("[data-save]");

    if (applyTarget) {
      applyForJob(applyTarget.dataset.apply);
    }

    if (saveTarget) {
      toggleSaveJob(Number(saveTarget.dataset.save));
    }
  });

  ui.employerJobsList.addEventListener("click", (event) => {
    const editTarget = event.target.closest("[data-edit-job]");
    const deleteTarget = event.target.closest("[data-delete-job]");

    if (editTarget) {
      startEditEmployerJob(Number(editTarget.dataset.editJob));
    }

    if (deleteTarget) {
      deleteEmployerJob(Number(deleteTarget.dataset.deleteJob));
    }
  });
}

function init() {
  populateFilterOptions();
  bindEvents();
  loadProfileIntoForm();
  renderJobs();
  renderEmployerJobs();
  updateAccessPanels();
  renderSessionInfo();

  const currentUser = getCurrentUser();
  if (currentUser) {
    switchView(currentUser.role === "employer" ? "employer" : "jobs");
  }
}

init();
