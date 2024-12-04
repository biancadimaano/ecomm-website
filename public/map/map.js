// initialize the map
const map = L.map('map-container').setView([49.2827, -123.1207], 10); // centered around metro van
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// default marker icon (blue teardrop)
const defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

// highlighted marker icon (pink teardrop)
const highlightedIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    className: 'pink-marker', 
});

// style for pink markers
const style = document.createElement('style');
style.textContent = `
    .pink-marker {
        filter: hue-rotate(40deg) brightness(1.5) saturate(2); 
    }
`;
document.head.appendChild(style);

// get reports from localStorage
let reports = JSON.parse(localStorage.getItem('emergencyReports')) || [];
let markers = []; 

function displayReports(filteredReports = reports) {
    markers.forEach(({ marker }) => marker.remove()); 
    markers = [];

    filteredReports.forEach((report) => {
        if (report.coordinates) {
            const [lat, lng] = report.coordinates.split(',').map(coord => parseFloat(coord.trim()));
            const marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);

            markers.push({ marker, report });

            // marker click handler
            marker.on('click', function () {
                highlightMarker(marker);
                showPopup(report);
                highlightReport(report);
            });
        }
    });
}

// popup container ref
const popupContainer = document.getElementById('popup-container');

function showPopup(report) {
    popupContainer.innerHTML = `
        <button class="close-btn">✖</button>
        <h3>${report.natureEmergency}</h3>
        <p class="location"><strong>Location:</strong> ${report.location}</p>
        <p class="datetime"><strong>Reported At:</strong> ${new Date(report.timeDate).toLocaleDateString()}<br>${new Date(report.timeDate).toLocaleTimeString()}</p>
        <button class="status-btn">Status: ${report.status}</button>
        ${report.image ? `<img src="${report.image}" alt="Emergency Image" style="max-width: 100%;">` : '<p>No image provided.</p>'}
        <p><strong>Reported by:</strong><br>${report.firstName} ${report.lastName} (${report.phoneNumber})</p>
        <p><strong>Comments:</strong><br>${report.comments}</p>
    `;
    popupContainer.style.display = 'block';

    // Close popup functionality
    const closeBtn = popupContainer.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popupContainer.style.display = 'none';
        resetMarkerHighlights();
    });

    // Show status popup when the status button is clicked
    const statusBtn = popupContainer.querySelector('.status-btn');
    statusBtn.addEventListener('click', () => {
        showStatusPopup(report);
        popupContainer.style.display = 'none'; // Close the report popup
    });
}

function deleteReport(report) {
    reports = reports.filter(r => r!== report);

    localStorage.setItem('emergencyReports', JSON.stringify(reports));

    const markerEntry = markers.find(({ report: r }) => r === report);
    if(markerEntry) {
        markerEntry.marker.remove();
        markers = markers.filter(m => m !== markerEntry);
    }

    generateReportList(reports);
    displayReports(reports);

    const popup = document.querySelector('.status-popup');
    if (popup) popup.remove();

    alert("Report deleted successfully.");
}

function showStatusPopup(report) {
    popupContainer.innerHTML = ''; 
    popupContainer.style.display = 'none';

    // Create a new status popup
    const statusPopup = document.createElement('div');
    statusPopup.classList.add('status-popup');

    statusPopup.innerHTML = `
        <button class="close-btn">✖</button>
        <h3>Change Report Status</h3>

        <h4>Report Details</h4>
        <p>
            <strong>Nature:</strong> ${report.natureEmergency}<br>
            <strong>Location:</strong> ${report.location}<br>
            <strong>Reported At:</strong> ${new Date(report.timeDate).toLocaleString()}
        </p>

        <h4>Change status to:</h4>

        <button class="update-status" data-status="OPEN">OPEN</button>
        <button class="update-status" data-status="RESOLVED">RESOLVED</button>
        <button class="update-status" data-status="DELETE">DELETE</button>
        
        <h4>Passcode</h4>
        <p>${report.passcode}</p>

        <label for="entered-passcode">Enter Passcode:</label>
        <input type="text" id="entered-passcode" class="entered-passcode" placeholder="Enter passcode here">

        <button class="submit-status">Submit</button>
    `;

    const mainElement = document.querySelector('main');
    mainElement.appendChild(statusPopup);

    statusPopup.style.display = 'block';

    // Close status popup functionality
    const closeBtn = statusPopup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        statusPopup.remove();
    });

    // Handle status button selection
    const statusButtons = statusPopup.querySelectorAll('.update-status');
    let selectedStatus = null;

    statusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            statusButtons.forEach(button => button.classList.remove('selected'));
            btn.classList.add('selected');
            selectedStatus = btn.dataset.status;
        });
    });

    // Handle Submit button click
    const submitBtn = statusPopup.querySelector('.submit-status');
    submitBtn.addEventListener('click', () => {
        const enteredPasscode = statusPopup.querySelector('#entered-passcode').value.trim();

        if (!selectedStatus) {
            alert('Please select a status.');
            return;
        }

        if (enteredPasscode !== report.passcode) {
            alert('Incorrect passcode. Please try again.');
            return;
        }

        if (selectedStatus === 'DELETE') {
            if (confirm('Are you sure you want to delete this report?')) {
                deleteReport(report);
                statusPopup.remove();
                return;
            } else {
                return;
            }
        } else {
            // Update report status
            report.status = selectedStatus;
            localStorage.setItem('emergencyReports', JSON.stringify(reports));

            generateReportList(reports);
            displayReports(reports);

            statusPopup.remove();
            showPopup(report); 
            return;
        }
    });
}

function highlightMarker(selectedMarker) {
    markers.forEach(({ marker }) => marker.setIcon(defaultIcon));
    selectedMarker.setIcon(highlightedIcon);
}

function resetMarkerHighlights() {
    markers.forEach(({ marker }) => marker.setIcon(defaultIcon));
}

function highlightReport(report) {
    document.querySelectorAll('.reports .grid').forEach((el) => {
        el.classList.remove('highlight');
    });

    const reportElements = document.querySelectorAll('.reports .grid');
    reportElements.forEach((el) => {
        const reportTitle = el.querySelector('h3').textContent;
        if (reportTitle === report.natureEmergency) {
            el.classList.add('highlight');
        }
    });
}

// generate report list
function generateReportList(filteredReports) {
    const reportsContainer = document.querySelector('.reports');
    reportsContainer.innerHTML = ''; // clear list

    filteredReports.forEach((report) => {
        const reportElement = document.createElement('div');
        reportElement.classList.add('grid');
        reportElement.innerHTML = `
            <h3>${report.natureEmergency}</h3>
            <p class="location">${report.location}</p>
            <p class="time">${new Date(report.timeDate).toLocaleTimeString()}</p>
            <p class="date">${new Date(report.timeDate).toLocaleDateString()}</p>
            <em>${report.status}</em>
        `;

        // handle report click
        reportElement.addEventListener('click', (e) => {
            e.stopPropagation();
            highlightReport(report);
            const markerEntry = markers.find(({ report: r }) => r === report);
            if (markerEntry) {
                highlightMarker(markerEntry.marker);
            }
            showPopup(report);
        });

        reportsContainer.appendChild(reportElement);
    });
}

// filter reports by map bounds
function filterReportsByBounds() {
    const bounds = map.getBounds();
    const filteredReports = reports.filter(report => {
        if (report.coordinates) {
            const [lat, lng] = report.coordinates.split(',').map(coord => parseFloat(coord.trim()));
            return bounds.contains([lat, lng]);
        }
        return false;
    });

    generateReportList(filteredReports);
    displayReports(filteredReports);
}

// initialize the map and reports
map.on('moveend', filterReportsByBounds); 
filterReportsByBounds(); 