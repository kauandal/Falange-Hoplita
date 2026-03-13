const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Criar pasta dist se não existir
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copiar arquivos essenciais
const filesToCopy = [
  'main.js',
  'login.html',
  'index.html',
  'renderer.js',
  'style.css',
  'package.json',
  'ITS.png',
  'acessos.json'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`Copiado: ${file}`);
  } else {
    console.log(`Arquivo não encontrado: ${file}`);
  }
});

// Criar arquivo batch para iniciar
const batchContent = `@echo off
title Tela de Ferro
cd /d "%~dp0"
echo Iniciando Tela de Ferro...
npx electron .
pause`;

fs.writeFileSync('dist/Tela de Ferro.bat', batchContent);

// Criar README
const readmeContent = `# Tela de Ferro - Sistema Kiosk

## Como executar:

### Método 1: Batch (Recomendado)
1. Dê duplo clique em "Tela de Ferro.bat"
2. O sistema iniciará em modo kiosk

### Método 2: Manual
1. Abra o terminal na pasta dist
2. Execute: npx electron .

## Credenciais:
- **TI:** ti / ti123 (pode fechar com ESC)
- **Serasa:** opSerasa / op123 (modo kiosk restrito)
- **Cagece:** opCagece / op123 (modo kiosk restrito)
- **Scgás:** scgas / scgas (modo kiosk restrito)
- **Senha de saída:** 123456 (apenas para TI)

## Segurança:
- Barra de tarefas oculta
- Atalhos bloqueados
- DevTools desabilitado
- Modo kiosk para operadores
`;

fs.writeFileSync('dist/README.md', readmeContent);

console.log('\n✅ Build concluído!');
console.log('📁 Pasta "dist" criada com executável');
console.log('🚀 Execute "Tela de Ferro.bat" para iniciar');
