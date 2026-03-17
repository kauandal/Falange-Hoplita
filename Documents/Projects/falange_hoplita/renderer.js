const { ipcRenderer } = require('electron');

// Taskbar functionality
let startMenuOpen = false;
let notificationsMenuOpen = false;
let notifications = [];

// Toggle Start Menu
function toggleStartMenu() {
  const startMenu = document.getElementById('start-menu');
  const notificationsMenu = document.getElementById('notifications-menu');

  // Close notifications menu if open
  if (notificationsMenuOpen) {
    notificationsMenu.classList.remove('show');
    notificationsMenuOpen = false;
  }

  // Toggle start menu
  startMenuOpen = !startMenuOpen;
  if (startMenuOpen) {
    startMenu.classList.add('show');
  } else {
    startMenu.classList.remove('show');
  }
}

// Toggle Notifications Menu
function toggleNotificationsMenu() {
  const notificationsMenu = document.getElementById('notifications-menu');
  const startMenu = document.getElementById('start-menu');

  // Close start menu if open
  if (startMenuOpen) {
    startMenu.classList.remove('show');
    startMenuOpen = false;
  }

  // Toggle notifications menu
  notificationsMenuOpen = !notificationsMenuOpen;
  if (notificationsMenuOpen) {
    notificationsMenu.classList.add('show');
    updateNotificationsDisplay();
  } else {
    notificationsMenu.classList.remove('show');
  }
}

// Close all menus when clicking outside
function closeAllMenus() {
  const startMenu = document.getElementById('start-menu');
  const notificationsMenu = document.getElementById('notifications-menu');

  startMenu.classList.remove('show');
  notificationsMenu.classList.remove('show');
  startMenuOpen = false;
  notificationsMenuOpen = false;
}

// Search functionality
function handleSearch(query) {
  if (!query.trim()) return;

  // Filter apps based on search query
  const filteredApps = userData.apps.filter(app =>
    app.name.toLowerCase().includes(query.toLowerCase())
  );

  // You can display search results here
  console.log('Search results:', filteredApps);
}

// Add notification
function addNotification(title, message, type = 'info') {
  const notification = {
    id: Date.now(),
    title,
    message,
    type,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };

  notifications.unshift(notification);

  // Keep only last 10 notifications
  if (notifications.length > 10) {
    notifications = notifications.slice(0, 10);
  }

  updateNotificationsBadge();
}

// Update notifications badge
function updateNotificationsBadge() {
  const notificationsBtn = document.getElementById('notifications-btn');
  const count = notifications.length;

  if (count > 0) {
    notificationsBtn.innerHTML = `
      <span class="taskbar-icon">🔔</span>
      <span class="notification-badge">${count}</span>
    `;
  } else {
    notificationsBtn.innerHTML = `<span class="taskbar-icon">🔔</span>`;
  }
}

// Update notifications display
function updateNotificationsDisplay() {
  const content = document.getElementById('notifications-content');

  if (notifications.length === 0) {
    content.innerHTML = '<div class="no-notifications">Nenhuma notificação</div>';
  } else {
    content.innerHTML = notifications.map(notif => `
      <div class="notification-item">
        <div class="notification-title">${notif.title}</div>
        <div class="notification-message">${notif.message}</div>
        <div class="notification-time">${notif.time}</div>
      </div>
    `).join('');
  }
}

// Clear all notifications
function clearNotifications() {
  notifications = [];
  updateNotificationsBadge();
  updateNotificationsDisplay();
}

// Restart system
function restartSystem() {
  if (confirm('Tem certeza que deseja reiniciar o sistema?')) {
    ipcRenderer.send('restart-system');
  }
}

// Taskbar clock functionality
function updateTaskbarClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const taskbarClock = document.getElementById('taskbar-clock');
  if (taskbarClock) {
    taskbarClock.textContent = timeString;
  }
}

// Update taskbar clock immediately and then every second
updateTaskbarClock();
setInterval(updateTaskbarClock, 1000);

// Taskbar app functionality
function initializeTaskbarApps() {
  const startBtn = document.querySelector('.start-btn');
  const taskbarApps = document.querySelectorAll('.taskbar-app');
  
  if (startBtn) {
    startBtn.addEventListener('click', toggleStartMenu);
  }
  
  // Add click handlers to taskbar apps
  taskbarApps.forEach((app, index) => {
    app.addEventListener('click', () => {
      // Add visual feedback
      app.style.background = 'rgba(255, 107, 53, 0.3)';
      setTimeout(() => {
        app.style.background = 'rgba(255,255,255,0.05)';
      }, 200);
      
      // Add notification
      addNotification('Aplicativo', `Abrindo ${app.textContent.trim()}...`, 'info');
    });
  });
}

// Initialize taskbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeTaskbarApps();
  
  // Start menu button
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', toggleStartMenu);
  }

  // Notifications button
  const notificationsBtn = document.getElementById('notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', toggleNotificationsMenu);
  }

  // Settings button
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      addNotification('Configurações', 'Painel de configurações em desenvolvimento', 'info');
      if (!notificationsMenuOpen) {
        toggleNotificationsMenu();
      }
    });
  }

  // Search input
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch(e.target.value);
      }
    });
  }

  // Search button
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      handleSearch(searchInput.value);
    });
  }

  // Restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', restartSystem);
  }

  // Clear notifications button
  const clearBtn = document.querySelector('.clear-notifications');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearNotifications);
  }

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInsideStartMenu = e.target.closest('#start-menu') || e.target.closest('#start-btn');
    const isClickInsideNotificationsMenu = e.target.closest('#notifications-menu') || e.target.closest('#notifications-btn');

    if (!isClickInsideStartMenu && !isClickInsideNotificationsMenu) {
      closeAllMenus();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // ESC to close menus
    if (e.key === 'Escape') {
      closeAllMenus();
    }

    // Windows key or Ctrl+Esc to toggle start menu
    if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
      e.preventDefault();
      toggleStartMenu();
    }
  });
});

// Atualizar data e hora
function updateDateTime() {
  const now = new Date();
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };
  const dateTimeString = now.toLocaleString('pt-BR', options);

  const horarioElement = document.querySelector('.horario');
  if (horarioElement) {
    horarioElement.textContent = dateTimeString;
  }
}

// Atualizar imediatamente e depois a cada 15 segundo
updateDateTime();
setInterval(updateDateTime, 15000);

// Recebe informações do usuário e apps
let userData = {};
ipcRenderer.on('user-data', (event, userData) => {
  window.userData = userData; // Store for search functionality

  document.getElementById('user-type').textContent = userData.displayName;

  // Update menu user info
  const menuUserName = document.getElementById('menu-user-name');
  const menuUserType = document.getElementById('menu-user-type');
  if (menuUserName) menuUserName.textContent = userData.displayName;
  if (menuUserType) menuUserType.textContent = userData.userType === 'ti' ? 'Administrador TI' : 'Usuário';

  // Limpar apps anteriores antes de adicionar novos
  const existingAppsGrid = document.querySelector('.apps-grid');
  if (existingAppsGrid) {
    existingAppsGrid.remove();
  }

  const existingEscInfo = document.querySelector('.esc-info');
  if (existingEscInfo) {
    existingEscInfo.remove();
  }

  // Criar grid de apps
  const appsContainer = document.createElement('div');
  appsContainer.className = 'apps-grid';

  userData.apps.forEach(app => {
    const appButton = document.createElement('button');
    appButton.className = 'app-button';
    appButton.innerHTML = `
      <div class="app-icon">${app.icon}</div>
      <div class="app-name">${app.name}</div>
    `;
    appButton.onclick = () => launchApp(app.path);
    appsContainer.appendChild(appButton);
  });

  // Inserir apps após o content
  const content = document.querySelector('.content');
  content.appendChild(appsContainer);

  // Adicionar apps no menu iniciar
  const menuApps = document.getElementById('menu-apps');
  if (menuApps) {
    menuApps.innerHTML = '';
    userData.apps.forEach(app => {
      const menuApp = document.createElement('div');
      menuApp.className = 'menu-app';
      menuApp.innerHTML = `
        <div class="menu-app-icon">${app.icon}</div>
        <div class="menu-app-name">${app.name}</div>
      `;
      menuApp.onclick = () => {
        launchApp(app.path);
        closeAllMenus();
      };
      menuApps.appendChild(menuApp);
    });
  }

  // Adicionar informação sobre ESC para TI
  if (userData.userType === 'ti') {
    const escInfo = document.createElement('div');
    escInfo.className = 'esc-info';
    escInfo.textContent = 'Pressione ESC para fechar o sistema';
    content.appendChild(escInfo);

    // Add welcome notification for TI users
    addNotification('Bem-vindo', 'Sessão de administrador iniciada', 'success');
  } else {
    // Add welcome notification for regular users
    addNotification('Bem-vindo', `Bem-vindo ${userData.displayName}`, 'info');
  }
});

function launchApp(appPath) {
  ipcRenderer.send('launch-app', appPath);
  addNotification('Aplicativo', 'Iniciando aplicativo...', 'info');
}

function logout() {
  if (confirm('Tem certeza que deseja sair do sistema?')) {
    ipcRenderer.send('logout-request');
  }
}