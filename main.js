// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    const cameraBtn = document.getElementById('camera-btn');
    const galleryBtn = document.getElementById('gallery-btn');
    const fileInput = document.getElementById('file-input');
    const cameraInput = document.getElementById('camera-input');
    const photoGallery = document.getElementById('photo-gallery');
    const scanBtn = document.getElementById('scan-btn');
    const scanResults = document.getElementById('scan-results');
    const loadingElement = document.getElementById('loading');
    const dataSummary = document.getElementById('data-summary');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    // Tab navigation
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Language buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    let currentLang = 'en';
    
    // Application state
    let uploadedImages = [];
    let scannedData = [];
    
    // Event Listeners
    cameraBtn.addEventListener('click', () => cameraInput.click());
    galleryBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    cameraInput.addEventListener('change', handleFileSelect);
    
    scanBtn.addEventListener('click', scanDocuments);
    
    whatsappBtn.addEventListener('click', sendViaWhatsApp);
    
    // Tab navigation event listeners
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabItems.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // If switching to send tab, update data summary
            if (tabId === 'send') {
                updateDataSummary();
            }
        });
    });
    
    // Language switcher
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.getAttribute('data-lang');
            updateUILanguage();
        });
    });
    
    // Functions
    function handleFileSelect(event) {
        const files = event.target.files;
        
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const imageData = {
                            id: Date.now() + i,
                            file: file,
                            src: e.target.result
                        };
                        
                        uploadedImages.push(imageData);
                        addImageToGallery(imageData);
                    };
                    
                    reader.readAsDataURL(file);
                }
            }
            
            // Reset file input
            event.target.value = '';
            
            // Show scan button if images are uploaded
            if (uploadedImages.length > 0) {
                scanBtn.style.display = 'inline-flex';
            }
        }
    }
    
    function addImageToGallery(imageData) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.dataset.id = imageData.id;
        
        photoItem.innerHTML = `
            <img src="${imageData.src}" alt="ID Document">
            <div class="remove-photo" data-id="${imageData.id}">×</div>
        `;
        
        photoGallery.appendChild(photoItem);
        
        // Add event listener to remove button
        photoItem.querySelector('.remove-photo').addEventListener('click', function() {
            const photoId = this.getAttribute('data-id');
            removeImage(photoId);
        });
    }
    
    function removeImage(photoId) {
        // Remove from DOM
        const photoElement = document.querySelector(`.photo-item[data-id="${photoId}"]`);
        if (photoElement) {
            photoElement.remove();
        }
        
        // Remove from array
        uploadedImages = uploadedImages.filter(img => img.id != photoId);
        
        // Hide scan button if no images
        if (uploadedImages.length === 0) {
            scanBtn.style.display = 'none';
        }
    }
    
    function scanDocuments() {
        if (uploadedImages.length === 0) {
            alert('Please upload at least one ID document.');
            return;
        }
        
        // Check if Tesseract.js is available
        if (typeof Tesseract === 'undefined') {
            alert('OCR library not loaded. Please check your internet connection and reload the page.');
            return;
        }
        
        // Show loading indicator
        loadingElement.style.display = 'block';
        scanBtn.disabled = true;
        
        // Clear previous results
        scannedData = [];
        scanResults.innerHTML = '';
        
        // Process each image with OCR
        const scanPromises = uploadedImages.map((image, index) => 
            processImageWithOCR(image, index + 1)
        );
        
        Promise.all(scanPromises)
            .then(() => {
                // Display results
                displayScanResults();
            })
            .catch(error => {
                console.error('Error scanning documents:', error);
                scanResults.innerHTML = `<p>Error scanning documents: ${error.message}</p>`;
            })
            .finally(() => {
                // Hide loading indicator
                loadingElement.style.display = 'none';
                scanBtn.disabled = false;
                
                // Enable WhatsApp button
                whatsappBtn.disabled = false;
            });
    }
    
    function processImageWithOCR(image, idNumber) {
        return Tesseract.recognize(
            image.src,
            'eng+ita', // Language recognition for English and Italian
            {
                logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            // Extract relevant information from the OCR text
            const extractedData = extractIDInformation(text);
            
            // Store the scanned data
            scannedData.push({
                id: idNumber,
                imageId: image.id,
                rawText: text,
                extractedData: extractedData
            });
            
            return extractedData;
        });
    }
    
    function extractIDInformation(text) {
        // This is a simple extraction logic
        // In a real application, this would be more sophisticated
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Basic extraction - looking for common patterns in IDs
        const data = {
            documentType: findDocumentType(text),
            name: findName(text),
            surname: findSurname(text),
            birthDate: findBirthDate(text),
            documentNumber: findDocumentNumber(text),
            expiryDate: findExpiryDate(text),
            nationality: findNationality(text),
            address: findAddress(text)
        };
        
        return data;
    }
    
    // Helper functions to extract specific data from OCR text
    function findDocumentType(text) {
        const docTypes = ['IDENTITY CARD', 'PASSPORT', 'DRIVER LICENSE', 'CARTA D\'IDENTITÀ', 'PATENTE'];
        for (const type of docTypes) {
            if (text.toUpperCase().includes(type)) {
                return type;
            }
        }
        return 'Unknown';
    }
    
    function findName(text) {
        const namePatterns = [
            /NAME[:\s]+([A-Za-z\s]+)/i,
            /NOME[:\s]+([A-Za-z\s]+)/i,
            /FIRST NAME[:\s]+([A-Za-z\s]+)/i
        ];
        
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return 'Not found';
    }
    
    function findSurname(text) {
        const surnamePatterns = [
            /SURNAME[:\s]+([A-Za-z\s]+)/i,
            /COGNOME[:\s]+([A-Za-z\s]+)/i,
            /LAST NAME[:\s]+([A-Za-z\s]+)/i
        ];
        
        for (const pattern of surnamePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return 'Not found';
    }
    
    function findBirthDate(text) {
        // Common date formats: DD.MM.YYYY, DD/MM/YYYY, etc.
        const datePatterns = [
            /BIRTH\s+DATE[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i,
            /DATA\s+DI\s+NASCITA[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i,
            /DOB[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i,
            /NATO\s+IL[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i
        ];
        
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        // Try to find any date format
        const genericDatePattern = /([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/;
        const match = text.match(genericDatePattern);
        if (match && match[1]) {
            return match[1].trim();
        }
        
        return 'Not found';
    }
    
    function findDocumentNumber(text) {
        const numberPatterns = [
            /DOCUMENT\s+NO[\.:\s]+([A-Z0-9]+)/i,
            /NUMERO[:\s]+([A-Z0-9]+)/i,
            /ID\s+NUMBER[:\s]+([A-Z0-9]+)/i,
            /PASSPORT\s+NO[\.:\s]+([A-Z0-9]+)/i
        ];
        
        for (const pattern of numberPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        // Try to find alphanumeric sequences that might be document numbers
        const genericPattern = /([A-Z]{2}[0-9]{6,7})/;
        const match = text.match(genericPattern);
        if (match && match[1]) {
            return match[1].trim();
        }
        
        return 'Not found';
    }
    
    function findExpiryDate(text) {
        const expiryPatterns = [
            /EXPIRY\s+DATE[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i,
            /EXPIRES[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i,
            /DATA\s+DI\s+SCADENZA[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i,
            /SCADE\s+IL[:\s]+([0-9]{1,2}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{2,4})/i
        ];
        
        for (const pattern of expiryPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return 'Not found';
    }
    
    function findNationality(text) {
        const nationalityPatterns = [
            /NATIONALITY[:\s]+([A-Za-z\s]+)/i,
            /NATIONALITÀ[:\s]+([A-Za-z\s]+)/i,
            /CITTADINANZA[:\s]+([A-Za-z\s]+)/i
        ];
        
        for (const pattern of nationalityPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return 'Not found';
    }
    
    function findAddress(text) {
        const addressPatterns = [
            /ADDRESS[:\s]+([A-Za-z0-9\s,.]+)/i,
            /INDIRIZZO[:\s]+([A-Za-z0-9\s,.]+)/i,
            /RESIDENZA[:\s]+([A-Za-z0-9\s,.]+)/i
        ];
        
        for (const pattern of addressPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return 'Not found';
    }
    
    function displayScanResults() {
        if (scannedData.length === 0) {
            scanResults.innerHTML = '<p>No data found from scanned documents.</p>';
            return;
        }
        
        let resultsHTML = '';
        
        scannedData.forEach(data => {
            const { id, extractedData } = data;
            
            resultsHTML += `
                <div class="id-data">
                    <h3>ID Document #${id}</h3>
                    <p><strong>Document Type:</strong> ${extractedData.documentType}</p>
                    <p><strong>Name:</strong> ${extractedData.name}</p>
                    <p><strong>Surname:</strong> ${extractedData.surname}</p>
                    <p><strong>Birth Date:</strong> ${extractedData.birthDate}</p>
                    <p><strong>Document Number:</strong> ${extractedData.documentNumber}</p>
                    <p><strong>Expiry Date:</strong> ${extractedData.expiryDate}</p>
                    <p><strong>Nationality:</strong> ${extractedData.nationality}</p>
                    <p><strong>Address:</strong> ${extractedData.address}</p>
                </div>
            `;
        });
        
        scanResults.innerHTML = resultsHTML;
        
        // Switch to send tab
        document.querySelector('.tab-item[data-tab="send"]').click();
    }
    
    function updateDataSummary() {
        if (scannedData.length === 0) {
            dataSummary.innerHTML = '<p>No data available. Please scan documents first.</p>';
            whatsappBtn.disabled = true;
            return;
        }
        
        let summaryHTML = '<h3>Document Summary</h3>';
        
        scannedData.forEach(data => {
            const { id, extractedData } = data;
            
            summaryHTML += `
                <div class="id-data">
                    <h3>ID Document #${id}</h3>
                    <p><strong>Document Type:</strong> ${extractedData.documentType}</p>
                    <p><strong>Name:</strong> ${extractedData.name}</p>
                    <p><strong>Surname:</strong> ${extractedData.surname}</p>
                    <p><strong>Birth Date:</strong> ${extractedData.birthDate}</p>
                    <p><strong>Document Number:</strong> ${extractedData.documentNumber}</p>
                </div>
            `;
        });
        
        dataSummary.innerHTML = summaryHTML;
        whatsappBtn.disabled = false;
    }
    
    function sendViaWhatsApp() {
        if (scannedData.length === 0) {
            alert('No data to send. Please scan documents first.');
            return;
        }
        
        // Format data for WhatsApp message
        let messageText = 'ID DOCUMENT DATA:\n\n';
        
        scannedData.forEach(data => {
            const { id, extractedData } = data;
            
            messageText += `ID #${id}:\n`;
            messageText += `Document Type: ${extractedData.documentType}\n`;
            messageText += `Name: ${extractedData.name}\n`;
            messageText += `Surname: ${extractedData.surname}\n`;
            messageText += `Birth Date: ${extractedData.birthDate}\n`;
            messageText += `Document Number: ${extractedData.documentNumber}\n`;
            messageText += `Expiry Date: ${extractedData.expiryDate}\n`;
            messageText += `Nationality: ${extractedData.nationality}\n`;
            messageText += `Address: ${extractedData.address}\n\n`;
        });
        
        // Open WhatsApp with the message
        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/393651855555?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    }
    
    function updateUILanguage() {
        const translations = {
            en: {
                title: 'ID Scanner',
                scanTab: 'Scan ID',
                sendTab: 'Send Data',
                uploadTitle: 'Upload ID Documents',
                uploadDesc: 'Take a photo or select images of identification documents to scan',
                takePhoto: 'Take Photo',
                selectGallery: 'Select from Gallery',
                scanBtn: 'Scan Documents',
                scannedDataTitle: 'Scanned Data',
                noDocuments: 'No documents scanned yet. Upload IDs and press the Scan button.',
                sendTitle: 'Send Documents Data',
                sendDesc: 'Send the scanned ID data to the property via WhatsApp',
                noDataAvailable: 'No data available. Please scan documents first.',
                sendWhatsApp: 'Send via WhatsApp',
                loading: 'Processing images, please wait...',
                documentType: 'Document Type',
                name: 'Name',
                surname: 'Surname',
                birthDate: 'Birth Date',
                documentNumber: 'Document Number',
                expiryDate: 'Expiry Date',
                nationality: 'Nationality',
                address: 'Address'
            },
            it: {
                title: 'Scanner Documenti',
                scanTab: 'Scansiona',
                sendTab: 'Invia Dati',
                uploadTitle: 'Carica Documenti ID',
                uploadDesc: 'Scatta una foto o seleziona immagini dei documenti di identità da scansionare',
                takePhoto: 'Scatta Foto',
                selectGallery: 'Seleziona dalla Galleria',
                scanBtn: 'Scansiona Documenti',
                scannedDataTitle: 'Dati Scansionati',
                noDocuments: 'Nessun documento scansionato. Carica documenti e premi il pulsante Scansiona.',
                sendTitle: 'Invia Dati Documenti',
                sendDesc: 'Invia i dati ID scansionati alla proprietà tramite WhatsApp',
                noDataAvailable: 'Nessun dato disponibile. Per favore scansiona i documenti prima.',
                sendWhatsApp: 'Invia tramite WhatsApp',
                loading: 'Elaborazione immagini, attendere prego...',
                documentType: 'Tipo Documento',
                name: 'Nome',
                surname: 'Cognome',
                birthDate: 'Data di Nascita',
                documentNumber: 'Numero Documento',
                expiryDate: 'Data di Scadenza',
                nationality: 'Nazionalità',
                address: 'Indirizzo'
            }
        };
        
        // Get current language texts
        const texts = translations[currentLang];
        
        // Update the UI with the selected language
        document.querySelector('.header h1').textContent = texts.title;
        document.querySelectorAll('.tab-item')[0].querySelector('span:not(.material-icons)').textContent = texts.scanTab;
        document.querySelectorAll('.tab-item')[1].querySelector('span:not(.material-icons)').textContent = texts.sendTab;
        
        // Update scan tab
        document.querySelector('#scan-section .section-title').textContent = texts.uploadTitle;
        document.querySelector('#scan-section p').textContent = texts.uploadDesc;
        document.querySelector('#camera-btn span').textContent = texts.takePhoto;
        document.querySelector('#gallery-btn span').textContent = texts.selectGallery;
        document.querySelector('#scan-btn').textContent = texts.scanBtn;
        document.querySelector('#results-section .section-title').textContent = texts.scannedDataTitle;
        
        if (scanResults.innerHTML === '' || scanResults.innerHTML.includes('No documents scanned yet') || scanResults.innerHTML.includes('Nessun documento scansionato')) {
            scanResults.innerHTML = `<p>${texts.noDocuments}</p>`;
        }
        
        // Update send tab
        document.querySelector('#send-section .section-title').textContent = texts.sendTitle;
        document.querySelector('#send-section p').textContent = texts.sendDesc;
        document.querySelector('#whatsapp-btn span').textContent = texts.sendWhatsApp;
        
        // Update loading text
        document.querySelector('#loading p').textContent = texts.loading;
        
        // Update any existing scanned data
        updateScanResultsLanguage(texts);
        updateDataSummaryLanguage(texts);
    }
    
    function updateScanResultsLanguage(texts) {
        if (scannedData.length === 0) return;
        
        // Replace labels in scan results
        const resultElements = scanResults.querySelectorAll('.id-data');
        resultElements.forEach(el => {
            el.querySelectorAll('p').forEach(p => {
                updateFieldLabel(p, texts);
            });
        });
    }
    
    function updateDataSummaryLanguage(texts) {
        if (scannedData.length === 0) return;
        
        // Replace labels in data summary
        const summaryElements = dataSummary.querySelectorAll('.id-data');
        summaryElements.forEach(el => {
            el.querySelectorAll('p').forEach(p => {
                updateFieldLabel(p, texts);
            });
        });
    }
    
    function updateFieldLabel(element, texts) {
        if (element.innerHTML.includes('Document Type')) {
            element.innerHTML = element.innerHTML.replace('Document Type', texts.documentType);
        } else if (element.innerHTML.includes('Name')) {
            element.innerHTML = element.innerHTML.replace('Name', texts.name);
        } else if (element.innerHTML.includes('Surname')) {
            element.innerHTML = element.innerHTML.replace('Surname', texts.surname);
        } else if (element.innerHTML.includes('Birth Date')) {
            element.innerHTML = element.innerHTML.replace('Birth Date', texts.birthDate);
        } else if (element.innerHTML.includes('Document Number')) {
            element.innerHTML = element.innerHTML.replace('Document Number', texts.documentNumber);
        } else if (element.innerHTML.includes('Expiry Date')) {
            element.innerHTML = element.innerHTML.replace('Expiry Date', texts.expiryDate);
        } else if (element.innerHTML.includes('Nationality')) {
            element.innerHTML = element.innerHTML.replace('Nationality', texts.nationality);
        } else if (element.innerHTML.includes('Address')) {
            element.innerHTML = element.innerHTML.replace('Address', texts.address);
        }
    }
    
    // Initialize the app
    function initApp() {
        // Set default language
        updateUILanguage();
        
        // Hide scan button initially
        scanBtn.style.display = 'none';
        
        // Initialize empty scan results
        scanResults.innerHTML = '<p>' + (currentLang === 'en' ? 'No documents scanned yet. Upload IDs and press the Scan button.' : 'Nessun documento scansionato. Carica documenti e premi il pulsante Scansiona.') + '</p>';
        
        // Hide loading indicator
        loadingElement.style.display = 'none';
        
        // Disable WhatsApp button initially
        whatsappBtn.disabled = true;
    }
    
    // Call the init function
    initApp();
});
