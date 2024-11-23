document.getElementById("submit").addEventListener('click', function() {
    // get elements from the form
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const phoneNumber = document.getElementById('phone-number').value;
    const natureEmergency = document.getElementById('nature-emergency').value;
    const location = document.getElementById('location').value;
    const coordinates = document.getElementById('coordinates').value;
    const image = document.getElementById('image-file').value;
    const url = document.getElementById('image-url').value;
    const comments = document.getElementById('comments').value;

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
