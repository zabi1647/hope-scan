

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
   

   

    // Store the data (this example uses local storage)
    

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const contact = document.getElementById('contact').value;
    const address = document.getElementById('address').value;
    const cnic = document.getElementById('cnic').value;
    const decription = "";

    const patientData = { name, age, contact, address, cnic, decription };

    
    localStorage.setItem('patientData', JSON.stringify(patientData));
    // Redirect to the folder page
    window.location.href = 'folder_page.html';
}

// Optional: Retrieve all patient data (for viewing or processing)

