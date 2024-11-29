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
