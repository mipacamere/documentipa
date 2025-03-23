// Global variables
let deferredPrompt;
let photoFiles = [];
let scannedData = [];
let currentLanguage = 'en';

// Translations
const translations = {
  en: {
    scanTitle: 'Upload ID Documents',
    scanDescription: 'Take a photo or select images of identification documents to scan',
    takePhoto: 'Take Photo',
    selectGallery: 'Select from Gallery',
    scanDocuments: 'Scan Documents',
    scannedData: 'Scanned Data',
    sendTitle: 'Send Documents Data',
    sendDescription: 'Send the scanned ID data to the property via WhatsApp',
    sendWhatsApp: 'Send via WhatsApp',
    processing: 'Processing images, please wait...',
    noData: 'No data scanned yet. Please scan documents first.',
    idCard: 'ID Card',
    name: 'Name',
    surname: 'Surname',
    dateOfBirth: 'Date of Birth',
    documentNumber: 'Document Number',
    expiryDate: 'Expiry Date',
    nationality: 'Nationality',
    offline: 'You are currently offline',
    documentExtracted: 'Document data extracted successfully',
    scanningDocument: 'Scanning document',
    errorScanning: 'Error scanning document'
  },
  it: {
    scanTitle: 'Carica Documenti d\'Identità',
    scanDescription: 'Scatta una foto o seleziona immagini di documenti di identità da scansionare',
    takePhoto: 'Scatta Foto',
    selectGallery: 'Seleziona dalla Galleria',
    scanDocuments: 'Scansiona Documenti',
    scannedData: 'Dati Scansionati',
    sendTitle: 'Invia Dati dei Documenti',
    sendDescription: 'Invia i dati dell\'ID scansionati alla struttura tramite WhatsApp',
    sendWhatsApp: 'Invia tramite WhatsApp',
    processing: 'Elaborazione immagini, attendere prego...',
    noData: 'Nessun dato scansionato ancora. Per favore scansiona prima i documenti.',
    idCard: 'Carta d\'Identità',
    name: 'Nome',
    surname: 'Cognome',
    dateOfBirth: 'Data di Nascita',
    documentNumber: 'Numero Documento',
    expiryDate: 'Data di Scadenza',
    nationality: 'Nazionalità',
    offline: 'Sei attualmente offline',
    documentExtracted: 'Dati del documento estratti con successo',
    scanningDocument: 'Scansione documento',
    errorScanning: 'Errore durante la scansione del documento'
  }
};

// DOM elements
const elements = {
  tabs: document.querySelectorAll('.tab-item'),
  tabContents: document.querySelectorAll('.tab-content'),
  cameraBtn: document.getElementById('camera-btn'),
  galleryBtn: document.getElementById('gallery-btn'),
  scanBtn: document.getElementById('scan-btn'),
  whatsAppBtn: document.getElementById('whatsapp-btn'),
  fileInput: document.getElementById('file-input'),
  cameraInput: document.getElementById('camera-input'),
  photoGallery: document.getElementById('photo-gallery'),
  scanResults: document.getElementById('scan-results'),
  dataSummary: document.getElementById('data-summary'),
  loading: document.getElementById('loading'),
  langBtns: document.querySelectorAll('.lang-btn')
};

// Initialize the application
function initApp() {
  // Hide loading screen initially
  elements.loading.style.display = 'none';
  
  // Register service worker
  registerServiceWorker();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize language
  updateLanguage(currentLanguage);
  
  // Setup offline detection
  setupOfflineDetection();
  
  // Setup install prompt
  setupInstallPrompt();
}

// Register service worker for PWA functionality
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
}

// Set up event listeners for UI interactions
function setupEventListeners() {
  // Tab navigation
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Camera button
  elements.cameraBtn.addEventListener('click', () => {
    elements.cameraInput.click();
  });
  
  // Gallery button
  elements.galleryBtn.addEventListener('click', () => {
    elements.fileInput.click();
  });
  
  // File input (gallery) change
  elements.fileInput.addEventListener('change', handleFileSelection);
  
  // Camera input change
  elements.cameraInput.addEventListener('change', handleFileSelection);
  
  // Scan button
  elements.scanBtn.addEventListener('click', scanDocuments);
  
  // WhatsApp button
  elements.whatsAppBtn.addEventListener('click', sendToWhatsApp);
  
  // Language buttons
  elements.langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      updateLanguage(lang);
    });
  });
}

// Handle file selection from camera or gallery
function handleFileSelection(event) {
  const files = event.target.files;
  
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if file is an image
      if (file.type.match('image.*')) {
        addPhotoToGallery(file);
        photoFiles.push(file);
      }
    }
  }
  
  // Reset the input to allow selecting the same file again
  event.target.value = '';
}

// Add a photo to the gallery
function addPhotoToGallery(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    
    const img = document.createElement('img');
    img.src = e.target.result;
    img.alt = 'ID Document';
    
    const removeBtn = document.createElement('div');
    removeBtn.className = 'remove-photo';
    removeBtn.innerHTML = '<span class="material-icons">close</span>';
    removeBtn.addEventListener('click', () => {
      const index = Array.from(elements.photoGallery.children).indexOf(photoItem);
      if (index !== -1) {
        photoFiles.splice(index, 1);
        photoItem.remove();
      }
    });
    
    photoItem.appendChild(img);
    photoItem.appendChild(removeBtn);
    elements.photoGallery.appendChild(photoItem);
  };
  
  reader.readAsDataURL(file);
}

 async function performOCR(imageFile) {
    try {
      // Show loading indicator if you have one
      
      // Initialize worker
      const worker = await Tesseract.createWorker('eng');
      
      // Perform OCR
      const result = await worker.recognize(imageFile);
      const extractedText = result.data.text;
      
      // Clean up
      await worker.terminate();
      
      // Return the extracted text
      return extractedText;
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  }
      
      // Process the OCR result to extract ID information
      const extractedData = processOCRResult(result.data.text, i + 1);
      scannedData.push(extractedData);
      
      console.log(`Document ${i + 1} scanned:`, extractedData);
    }
    
    // Display results
    displayResults();
    
    // Enable WhatsApp button
    elements.whatsAppBtn.disabled = false;
    
    // Switch to results section
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error during scanning:', error);
    alert('An error occurred during scanning. Please try again.');
  } finally {
    // Hide loading screen
    elements.loading.style.display = 'none';
  }
}

// Process OCR result to extract ID information
function processOCRResult(text, idNumber) {
  console.log('Raw OCR text:', text);
  
  // Default extracted data structure
  const extractedData = {
    idNumber: idNumber,
    documentType: 'ID Card', // Default type
    name: findNameInText(text),
    surname: findSurnameInText(text),
    dateOfBirth: findDateOfBirthInText(text),
    documentNumber: findDocumentNumberInText(text),
    expiryDate: findExpiryDateInText(text),
    nationality: findNationalityInText(text),
    rawText: text // Store raw OCR text for debugging
  };
  
  return extractedData;
}

// Helper functions to extract specific data from OCR text
function findNameInText(text) {
  // Look for patterns like "Name: John" or "Nome: John"
  const namePatterns = [
    /\b(?:Name|Nome)\s*[:]\s*([A-Za-z]+)/i,
    /\b(?:First name|Nome)\b[^\n\r]*?([A-Za-z]+)/i,
    /\b(?:Given name|Nome)\b[^\n\r]*?([A-Za-z]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Not found';
}

function findSurnameInText(text) {
  // Look for patterns like "Surname: Smith" or "Cognome: Smith"
  const surnamePatterns = [
    /\b(?:Surname|Cognome)\s*[:]\s*([A-Za-z]+)/i,
    /\b(?:Last name|Cognome)\b[^\n\r]*?([A-Za-z]+)/i,
    /\b(?:Family name|Cognome)\b[^\n\r]*?([A-Za-z]+)/i
  ];
  
  for (const pattern of surnamePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Not found';
}

function findDateOfBirthInText(text) {
  // Look for date patterns like DD/MM/YYYY or DD.MM.YYYY
  const dobPatterns = [
    /\b(?:Date of Birth|Data di Nascita|DOB|Birth Date|NATO IL)\s*[:]\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /\b(?:Born|Nato)\s*(?:on|il)?\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/
  ];
  
  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Not found';
}

function findDocumentNumberInText(text) {
  // Look for document number patterns
  const docNumberPatterns = [
    /\b(?:Document Number|Numero Documento|ID Number|Card Number|Document No|Doc[\.:])\s*[:]\s*([A-Z0-9]+)/i,
    /\b(?:Nr|No|Num)[\.:]?\s*([A-Z0-9]+)/i,
    /([A-Z]{2}[0-9]{6,7})/
  ];
  
  for (const pattern of docNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Not found';
}

function findExpiryDateInText(text) {
  // Look for expiry date patterns
  const expiryPatterns = [
    /\b(?:Expiry Date|Data di Scadenza|Expiry|Expiration Date|SCAD|Scadenza|Valid Until)\s*[:]\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /\b(?:Expires|Scade|Valid to)\s*(?:on)?\s*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i
  ];
  
  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return 'Not found';
}

function findNationalityInText(text) {
  // Look for nationality patterns
  const nationalityPatterns = [
    /\b(?:Nationality|Nazionalità|Cittadinanza)\s*[:]\s*([A-Za-z]+)/i,
    /\b(?:Nation|Nazione)\s*[:]\s*([A-Za-z]+)/i,
    /\b(?:ITA|ITALIANA|ITALIAN|ESP|ESPAÑOLA|FRA|FRANCESE)\b/i
  ];
  
  for (const pattern of nationalityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    } else if (match) {
      // For the last pattern which doesn't have capture groups
      return match[0].trim();
    }
  }
  
  return 'Not found';
}

// Display scanned results in the UI
function displayResults() {
  elements.scanResults.innerHTML = '';
  elements.dataSummary.innerHTML = '';
  
  if (scannedData.length === 0) {
    elements.scanResults.innerHTML = `<p>${translations[currentLanguage].noData}</p>`;
    return;
  }
  
  scannedData.forEach(data => {
    const idDataElement = document.createElement('div');
    idDataElement.className = 'id-data';
    
    idDataElement.innerHTML = `
      <h3>${translations[currentLanguage].idCard} #${data.idNumber}</h3>
      <p><strong>${translations[currentLanguage].name}:</strong> ${data.name}</p>
      <p><strong>${translations[currentLanguage].surname}:</strong> ${data.surname}</p>
      <p><strong>${translations[currentLanguage].dateOfBirth}:</strong> ${data.dateOfBirth}</p>
      <p><strong>${translations[currentLanguage].documentNumber}:</strong> ${data.documentNumber}</p>
      <p><strong>${translations[currentLanguage].expiryDate}:</strong> ${data.expiryDate}</p>
      <p><strong>${translations[currentLanguage].nationality}:</strong> ${data.nationality}</p>
    `;
    
    elements.scanResults.appendChild(idDataElement);
    
    // Clone for data summary
    const dataSummaryElement = idDataElement.cloneNode(true);
    elements.dataSummary.appendChild(dataSummaryElement);
  });
}

// Switch between tabs
function switchTab(tabId) {
  // Update tab buttons
  elements.tabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update tab contents
  elements.tabContents.forEach(content => {
    if (content.id === `${tabId}-tab`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Send data to WhatsApp
function sendToWhatsApp() {
  if (scannedData.length === 0) {
    alert(translations[currentLanguage].noData);
    return;
  }
  
  let message = "ID Scanner Results:\n\n";
  
  scannedData.forEach(data => {
    message += `ID Card #${data.idNumber}:\n`;
    message += `${translations[currentLanguage].name}: ${data.name}\n`;
    message += `${translations[currentLanguage].surname}: ${data.surname}\n`;
    message += `${translations[currentLanguage].dateOfBirth}: ${data.dateOfBirth}\n`;
    message += `${translations[currentLanguage].documentNumber}: ${data.documentNumber}\n`;
    message += `${translations[currentLanguage].expiryDate}: ${data.expiryDate}\n`;
    message += `${translations[currentLanguage].nationality}: ${data.nationality}\n\n`;
  });
  
  // Encode the message for WhatsApp URL
  const encodedMessage = encodeURIComponent(message);
  
  // Open WhatsApp with the encoded message
  window.open(`https://wa.me/393651855555?text=${encodedMessage}`, '_blank');
}

// Update UI language
function updateLanguage(lang) {
  currentLanguage = lang;
  
  // Update language buttons
  elements.langBtns.forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update section titles and descriptions
  document.querySelector('#scan-section .section-title').textContent = translations[lang].scanTitle;
  document.querySelector('#scan-section p').textContent = translations[lang].scanDescription;
  document.querySelector('#results-section .section-title').textContent = translations[lang].scannedData;
  document.querySelector('#send-section .section-title').textContent = translations[lang].sendTitle;
  document.querySelector('#send-section p').textContent = translations[lang].sendDescription;
  
  // Update buttons
  elements.cameraBtn.innerHTML = `<span class="material-icons">camera_alt</span><span>${translations[lang].takePhoto}</span>`;
  elements.galleryBtn.innerHTML = `<span class="material-icons">photo_library</span><span>${translations[lang].selectGallery}</span>`;
  elements.scanBtn.innerHTML = `<span class="material-icons">document_scanner</span>${translations[lang].scanDocuments}`;
  elements.whatsAppBtn.innerHTML = `<span class="material-icons">whatsapp</span><span>${translations[lang].sendWhatsApp}</span>`;
  
  // Update tabs
  document.querySelector('.tab-item[data-tab="scan"] span:last-child').textContent = translations[lang].scanTitle;
  document.querySelector('.tab-item[data-tab="send"] span:last-child').textContent = translations[lang].sendTitle;
  
  // Update loading text
  document.querySelector('#loading p').textContent = translations[lang].processing;
  
  // Refresh results display if there are any
  if (scannedData.length > 0) {
    displayResults();
  }
}

// Setup offline detection and notification
function setupOfflineDetection() {
  // Check if the user is offline when the page loads
  if (!navigator.onLine) {
    showOfflineNotification();
  }
  
  // Listen for online status changes
  window.addEventListener('online', () => {
    hideOfflineNotification();
  });
  
  window.addEventListener('offline', () => {
    showOfflineNotification();
  });
}

// Show offline notification
function showOfflineNotification() {
  // Check if notification already exists
  if (!document.querySelector('.offline-notification')) {
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    
    notification.innerHTML = `
      <div class="offline-content">
        <span class="material-icons">wifi_off</span>
        <span>${translations[currentLanguage].offline}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Hide offline notification
function hideOfflineNotification() {
  const notification = document.querySelector('.offline-notification');
  if (notification) {
    notification.parentNode.removeChild(notification);
  }
}

// Setup install prompt for PWA
function setupInstallPrompt() {
  // Create install button
  const installButton = document.createElement('button');
  installButton.className = 'install-button';
  installButton.textContent = 'Install App';
  document.querySelector('.header').appendChild(installButton);
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    installButton.style.display = 'block';
  });
  
  // Handle install button click
  installButton.addEventListener('click', () => {
    if (deferredPrompt) {
      // Show the prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          installButton.style.display = 'none';
        } else {
          console.log('User dismissed the install prompt');
        }
        
        // Clear the saved prompt
        deferredPrompt = null;
      });
    }
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', (event) => {
    console.log('App was installed', event);
    installButton.style.display = 'none';
  });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
