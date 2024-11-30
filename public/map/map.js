// init the map
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
let markers = []; // store markers with reports

function displayReports(filteredReports = reports) {
    markers.forEach(({ marker }) => marker.remove()); // clear existing markers
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
        <p class="location"><strong></strong> ${report.location}</p>
<p class="datetime"><strong></strong> ${new Date(report.timeDate).toLocaleDateString()}<br>${new Date(report.timeDate).toLocaleTimeString()}</p>
        <button class="status-btn">Status: ${report.status} </button>
        ${report.image ? `<img src="${report.image}" alt="Emergency Image">` : '<p>No image provided.</p>'}
        <p><strong>Reported by</strong><br> ${report.firstName} ${report.lastName} ${report.phoneNumber}
        <p><strong>Comments</strong><br> ${report.comments}</p>
    `;
    popupContainer.style.display = 'block';

    // close popup
    const closeBtn = popupContainer.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popupContainer.style.display = 'none';
        resetMarkerHighlights();
    });

    // show status popup
    const statusBtn = popupContainer.querySelector('.status-btn');
    statusBtn.addEventListener('click', () => {
        showStatusPopup(report);
    });
}

// fcn to change the status
function showStatusPopup(report) {
    // make a new popup
    const popup = document.createElement('div');
    popup.classList.add('status-popup');

    popup.innerHTML = `
        <button class="close-btn">✖</button>
        <h3>Change Report Status</h3>

        <h4>Report</h4>
        <p>
            ${report.natureEmergency}, ${report.location}<br>
            ${new Date(report.timeDate).toLocaleString()}
        </p>

        <h4>Change status to</h4>

        <button class="update-status" data-status="OPEN">OPEN</button>
        <button class="update-status" data-status="RESOLVED">RESOLVED</button>
        
        <h4>Enter authorization code to change report status:</h4>
        <input type="text" placeholder="Enter password..." size="50">

        <br><br>

        <button class="submit-status">Submit</button>
    `;

    const mainElement = document.querySelector('main');
    mainElement.appendChild(popup);

    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    popup.querySelector('.submit-status').addEventListener('click', () => {
        popup.remove();
    });

    // update status
    popup.querySelectorAll('.update-status').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newStatus = e.target.dataset.status;
            report.status = newStatus;
            popup.remove();
            showPopup(report); 
            localStorage.setItem('emergencyReports', JSON.stringify(reports));
        });
    });
}


// highlight selected marker
function highlightMarker(selectedMarker) {
    markers.forEach(({ marker }) => marker.setIcon(defaultIcon));
    selectedMarker.setIcon(highlightedIcon);
}

// reset all markers
function resetMarkerHighlights() {
    markers.forEach(({ marker }) => marker.setIcon(defaultIcon));
}

// highlight corresponding report in the list
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

// init the map and reports
map.on('moveend', filterReportsByBounds); // trigger when map view changes
filterReportsByBounds(); // initial filter call
