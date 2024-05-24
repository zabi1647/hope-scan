let selectedFile;

function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file; // Store the selected file
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("preview");
      preview.src = e.target.result;
      document.getElementById("image-preview").style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

async function uploadImage() {
  if (!selectedFile) {
    alert("No file selected!");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Success:", data);
    const formattedPrediction =
      data.prediction === 0 ? "Not Affected" : "Affected";
    const formattedConfidence = data.confidence; // Assuming data.confidence is 2.2332323
    const stringConfidence = formattedConfidence.toString(); // Convert to string
    const parts = stringConfidence.split("."); // Split at the dot
    const result = parts[1].substring(0, 2);
    alert(`Prediction: ${data.prediction} \nConfidence: ${result}`);

    // Format the prediction and confidence

    // Create description text
    const description = `Prediction: ${formattedPrediction} And \nConfidence: ${result}`;

    // Update patient data in local storage
    const patientData = JSON.parse(localStorage.getItem("patientData"));
    console.log("Patient data1:", patientData);
    patientData.description = description;
    localStorage.setItem("patientData", JSON.stringify(patientData));
   
    saveEditedData(description);
    // Show edit section and fill the description
  } catch (error) {
    console.error("Error:", error);
    alert(`An error occurred: ${error.message}`);
  }
}
function saveEditedData(description) {
  const patientData = JSON.parse(localStorage.getItem('patientData'));
  patientData.description = description;
  console.log('Updated patient data:', patientData);

  // Save the updated patient data back into local storage
  localStorage.setItem('patientData', JSON.stringify(patientData));

  // Save edited data in IndexedDB
  storePatientData(patientData);
  window.location.href = 'patient_data.html';
}



function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PatientDatabase", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("patients")) {
        db.createObjectStore("patients", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

function storePatientData(patientData) {
  console.log("into store data", patientData);
  openDatabase()
    .then((db) => {
      const transaction = db.transaction(["patients"], "readwrite");
      const objectStore = transaction.objectStore("patients");
      objectStore.add(patientData);

      transaction.oncomplete = () => {
        console.log("Patient data stored successfully!");
      };

      transaction.onerror = (event) => {
        console.error("Error storing patient data:", event.target.error);
      };
    })
    .catch((error) => {
      console.error("Error opening database:", error);
    });
}

function retrieveAllPatientData() {
  openDatabase()
    .then((db) => {
      const transaction = db.transaction(["patients"], "readonly");
      const objectStore = transaction.objectStore("patients");
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const patients = event.target.result;
        console.log("Retrieved patient data:", patients);
      };

      request.onerror = (event) => {
        console.error("Error retrieving patient data:", event.target.error);
      };
    })
    .catch((error) => {
      console.error("Error opening database:", error);
    });
}
