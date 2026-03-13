const { ipcRenderer } = require('electron');

// Atualizar data e hora
function updateDateTime() {
  const now = new Date();
  const options = { 
    hour: '2-digit', 
    minute: '2-digit', 
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
ipcRenderer.on('user-data', (event, userData) => {
  document.getElementById('user-type').textContent = userData.displayName;
  
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
  
  // Adicionar informação sobre ESC para TI
  if (userData.userType === 'ti') {
    const escInfo = document.createElement('div');
    escInfo.className = 'esc-info';
    escInfo.textContent = 'Pressione ESC para fechar o sistema';
    content.appendChild(escInfo);
  }
});

function launchApp(appPath) {
  ipcRenderer.send('launch-app', appPath);
}

function logout() {
  ipcRenderer.send('logout-request');
}


