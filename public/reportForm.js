// submit form
document.getElementById("report-form").addEventListener('submit', function(event) {
    // prevent form submission
    event.preventDefault();
    
    // clear previous errors
    const errorDiv = document.getElementById('errors');
    

    // get elements from the form
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();
    const natureEmergency = document.getElementById('nature-emergency').value.trim();
    const location = document.getElementById('location').value.trim();
    const coordinates = document.getElementById('coordinates').value.trim();
    const image = document.getElementById('image-file').value.trim();
    const url = document.getElementById('image-url').value.trim();
    const comments = document.getElementById('comments').value.trim();

    let isValid = true;

    // validation checks
    if(!firstName || !/^[A-Za-z]+$/.test(firstName)) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'First name is required and must contain only letters.';
        errorDiv.appendChild(errorMessage);
    }
    if(!lastName || !/^[A-Za-z]+$/.test(lastName)) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Last name is required and must contain only letters.';
        errorDiv.appendChild(errorMessage);
    }
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Phone number must be a 10-digit number.';
        errorDiv.appendChild(errorMessage);
    }
    if(!natureEmergency) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Nature of the emergency is required.';
        errorDiv.appendChild(errorMessage);
    }
    if(!location) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Location is required.';
        errorDiv.appendChild(errorMessage);
    }
    if (coordinates && !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|(\d{1,2}))(\.\d+)?)$/.test(coordinates)) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Coordinates must be in a valid latitude/longitude format.';
        errorDiv.appendChild(errorMessage);
    }

    if (url && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(url)) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Image URL must be a valid URL.';
        errorDiv.appendChild(errorMessage);
    }

    if (comments.length > 500) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Comments cannot exceed 500 characters.';
        errorDiv.appendChild(errorMessage);
    }

    // prevent form submission if invalid
    if (!isValid) {
        alert('Form unable to submit');
        return;
    }

    const data = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        natureEmergency: natureEmergency,
        location: location,
        coordinates: coordinates,
        image: image,
        url: url,
        comments: comments,
        timeDate: new Date().toISOString(),  // timeDate field
        status: 'OPEN'  // default status to OPEN
    };

    // get existing reports from localStorage
    let reports = JSON.parse(localStorage.getItem('emergencyReports')) || [];

    // add the new report to the array
    reports.push(data);

    // save the updated reports array back to localStorage
    localStorage.setItem('emergencyReports', JSON.stringify(reports));

    alert('Form submitted successfully');
});