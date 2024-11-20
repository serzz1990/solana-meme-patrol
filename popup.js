const telegramTokenInput = document.getElementById('telegramToken');
const telegramChatIdInput = document.getElementById('telegramChatId');
const addressesInput = document.getElementById('addresses');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');
const runButton = document.getElementById('run');

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('config', (result) => {
    const config = result.config || {};
    telegramTokenInput.value = config.telegramToken || '';
    telegramChatIdInput.value = config.telegramChatId || '';
    addressesInput.value = (config.addresses || []).join('\n');
    console.log('Configuration loaded automatically on startup.');
  });
});

saveButton.addEventListener('click', () => {
  const telegramToken = telegramTokenInput.value.trim();
  const telegramChatId = telegramChatIdInput.value.trim();
  const addresses = addressesInput.value.trim().split('\n');

  const config = { telegramToken, telegramChatId, addresses };
  chrome.storage.local.set({ config }, () => {
    statusDiv.textContent = 'Configuration saved successfully!';
    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    }, 1000); 
  });
});

runButton.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://solscan.io/' });
});


toggleTokenVisibility.addEventListener('click', () => {
  const isPassword = telegramTokenInput.type === 'password';
  telegramTokenInput.type = isPassword ? 'text' : 'password';
  toggleTokenVisibility.textContent = isPassword ? 'HIDE' : 'VIEW';
});

toggleChatIdVisibility.addEventListener('click', () => {
  const isPassword = telegramChatIdInput.type === 'password';
  telegramChatIdInput.type = isPassword ? 'text' : 'password';
  toggleChatIdVisibility.textContent = isPassword ? 'HIDE' : 'VIEW';
});

