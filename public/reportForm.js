async function geocodeLocation(location) {
    const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    try {
        const response = await fetch(geocodeURL);
        const data = await response.json();

        if (data && data.length > 0) {
            const coords = {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
            };
            return coords;
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

document.getElementById('location').addEventListener('blur', async function() {
    const locationInput = this.value.trim();
    if (locationInput) {
        try {
            const coords = await geocodeLocation(locationInput);
            const coordinates = `${coords.latitude}, ${coords.longitude}`;
            document.getElementById('coordinates').value = coordinates;
        } catch (error) {
            document.getElementById('coordinates').value = '';
            alert('Invalid location entered.');
        } 
    }
});

document.getElementById("report-form").addEventListener('submit', async function (event) {
    event.preventDefault();

    const errorDiv = document.getElementById('errors');
    errorDiv.innerHTML = ""; 

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();
    const natureEmergency = document.getElementById('nature-emergency').value.trim();
    const location = document.getElementById('location').value.trim();
    const fileInput = document.getElementById('image-file');
    const imageUrl = document.getElementById('image-url').value.trim();
    const comments = document.getElementById('comments').value.trim();

    let isValid = true;

    // Validation checks for text fields
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
    if(!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Phone number is required and must be 10 digits.';
        errorDiv.appendChild(errorMessage);
    }
    if(!natureEmergency) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Nature of the emergency is required.';
        errorDiv.appendChild(errorMessage);
    }
    if(!location && !coordinates) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Location is required.';
        errorDiv.appendChild(errorMessage);
    }

    if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(imageUrl) && imageUrl) {
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


    if (coordinates){
        try {
            const coords = await geocodeLocation(location);
            coordinates = `${coords.latitude}, ${coords.longitude}`;
            document.getElementById('coordinates').value = coordinates;
        } catch (error) {
            isValid = false;
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Invalid location entered. Please enter a valid location.';
            errorDiv.appendChild(errorMessage);
        }
    }

    if (!isValid) {
        alert('Form unable to submit');
        return;
    }

    let image = imageUrl || null; // Allow image to be null if no URL or file is provided
    if (!image && fileInput.files.length > 0) {
        try {
            const file = fileInput.files[0];
            image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error("Error reading file:", error);
            alert("Failed to process the image. Please try again.");
            return;
        }
    }

    // Passcode
    const randString = randomString(15);
    let passcode = '';
    try {
        passcode = await createHashPasscode(randString);
    } catch (error) {
        console.error('Error:', error);
    }

    const data = {
        firstName,
        lastName,
        phoneNumber,
        natureEmergency,
        location,
        coordinates,
        image, // Image can be null if not provided
        comments,
        timeDate: new Date().toISOString(),
        status: 'OPEN',
        passcode: passcode
    };

    const reports = JSON.parse(localStorage.getItem('emergencyReports')) || [];
    reports.push(data);
    localStorage.setItem('emergencyReports', JSON.stringify(reports));

    alert('Form submitted successfully. Your passcode is: ' + passcode);
    fileInput.value = ''; 
});

