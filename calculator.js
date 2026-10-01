const API_BASE = "http://127.0.0.1:8000";



const LoadCheckins = async () => {
    const response = await fetch(`${API_BASE}/api/checkin`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};


const Checkin = async () => {
    const response = await fetch(`${API_BASE}/api/checkin`,{
        method: "GET",
        headers: {"Content-Type":"application/json"}
    });
    if (!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const body = document.body;
body.style.background = "#0000";
function renderCheckinsTable(chekinsArray,containerID){
    const container = document.getElementById(containerID);
    if(!chekinsArray || chekinsArray.length === 0){
        container.innerHTML = "<p>No check-in records available.</p>";
        return;
    }
    let tableHTML = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background-color: #352f2f; text-align: left;">
                    <th style="padding: 8px; border: 1px solid #2e2626;">#</th>
                    <th style="padding: 8px; border: 1px solid #e6dcdc;">BMI Category</th>
                </tr>
            </thead>
            <tbody>

`;
    chekinsArray.forEach((record,index) => {
        tableHTML+=`
        <tr>
                <td style="padding: 8px; border: 1px solid #241616;">${index + 1}</td>
                <td style="padding: 8px; border: 1px solid #260c0c;">${record}</td>
            </tr>
        `;
        
    });

    tableHTML+=`
    </tbody>
    </table>`;
    container.innerHTML = tableHTML;

}

const loadAndDisplayTable = async () => {
    try {
        const data = await Checkin(); 
        // Assuming your backend returns {"BMI_Records": ["Overweight", "Normal Weight"]}
        renderCheckinsTable(data.BMI_Records, "table-container");
    } catch (error) {
        console.error("Failed to load records:", error);
    }
};
 
//======== Calculate Body Mass Index ========
//Creation of the form that will take the weight and height of the user and send it to the backend for BMI calculation
const form = document.getElementById("bmi-form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    form.querySelector("button").disabled = true; // Disable the button to prevent multiple submissions
    form.querySelector("button").textContent = "Calculating..."; // Change button text to indicate processing
   
    const weight = Number(document.getElementById("weight").value);
    const height = Number(document.getElementById("height").value);
    if (!weight || height) {
        await CalculateBMI(weight, height);
    }
});

const CalculateBMI = async (weight_kg, height_m) => {
    const response = await fetch(`${API_BASE}/api/calculate_bmi?weight_kg=${weight_kg}&height_m=${height_m}`,
        {method:"POST"}
    );
    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    html = `<p>Your BMI is: ${result.bmi}</p><p>BMI Category: ${result.category}</p>`;
    document.getElementById("bmi-result").innerHTML = html;
}
document.addEventListener("DOMContentLoaded", () => {
    loadAndDisplayTable();
    const weight = Number(document.getElementById("weight").value);
    const height = Number(document.getElementById("height").value);
    if (weight && height) {
        CalculateBMI(weight, height)
    };
});