// submit form
document.getElementById("submit").addEventListener('click', function() {
    // clear previous errors
    const errorDiv = document.getElementById('errors');
    errorDiv.innerHTML = '';

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
        errorDiv.innerHTML += '<p>First name is required and must contain only lettlers.</p>';
    }
    if(!lastName || !/^[A-Za-z]+$/.test(lastName)) {
        isValid = false;
        errorDiv.innerHTML += '<p>Last name is required and must contain only lettlers.</p>';
    }
    if(!phoneNumber || !/^[d{10}$]+$/.test(phoneNumber)) {
        isValid = false;
        errorDiv.innerHTML += '<p>Phone number must be a 10-digit number.</p>';
    }
    if(!natureEmergency) {
        isValid = false;
        errorDiv.innerHTML += '<p>Nature of the emergency is required.</p>';
    }
    if(!location) {
        isValid = false;
        errorDiv.innerHTML += '<p>Location is required.</p>';
    }
    if (coordinates && !/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|(\d{1,2}))(\.\d+)?)$/.test(coordinates)) {
        isValid = false;
        errorDiv.innerHTML += '<p>Coordinates must be in a valid latitude/longitude format.</p>';
    }

    if (url && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(url)) {
        isValid = false;
        errorDiv.innerHTML += '<p>Image URL must be a valid URL.</p>';
    }

    if (comments.length > 500) {
        isValid = false;
        errorDiv.innerHTML += '<p>Comments cannot exceed 500 characters.</p>';
    }

    // Prevent form submission if invalid
    if (!isValid) {
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
        comments: comments
    }

    localStorage.setItem('data', JSON.stringify(data));
    alert('Form submitted successfully');

});

document.addEventListener('DOMContentLoaded', function() {
    const savedData = localStorage.getItem('data');

    // testing the dom local storage output
    if(savedData){
        const data = JSON.parse(savedData);
        console.log("Form data:", data);

        document.getElementById('test').innerHTML = 
    data.firstName + data.lastName + "Reported: " + data.natureEmergency;
    }
});
