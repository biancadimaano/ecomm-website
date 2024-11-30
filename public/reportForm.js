document.getElementById("report-form").addEventListener('submit', async function (event) {
    event.preventDefault();

    const errorDiv = document.getElementById('errors');
    errorDiv.innerHTML = ""; 

    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const phoneNumber = document.getElementById('phone-number').value.trim();
    const natureEmergency = document.getElementById('nature-emergency').value.trim();
    const location = document.getElementById('location').value.trim();
    const coordinates = document.getElementById('coordinates').value.trim();
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

    // Ensure either image URL or image file is provided
    if (!imageUrl && fileInput.files.length === 0) {
        isValid = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'You must either upload an image or provide an image URL.';
        errorDiv.appendChild(errorMessage);
    }

    if (!isValid) {
        alert('Form unable to submit');
        return;
    }

    let image = imageUrl; 
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

    const data = {
        firstName,
        lastName,
        phoneNumber,
        natureEmergency,
        location,
        coordinates,
        image, 
        comments,
        timeDate: new Date().toISOString(),
        status: 'OPEN',
    };

    const reports = JSON.parse(localStorage.getItem('emergencyReports')) || [];
    reports.push(data);
    localStorage.setItem('emergencyReports', JSON.stringify(reports));

    alert('Form submitted successfully');
    fileInput.value = ''; 
});
