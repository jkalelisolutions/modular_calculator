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
        renderCheckinsTable(data.BMI_Records, "bmi-container");
        renderCheckinsTable(data.weekly_Report, "weekly-container");
        //renderCheckinsTable(data.Protocol, "protocol-container");
    } catch (error) {
        console.error("Failed to load records:", error);
    }
};
 
//======== Calculate Body Mass Index ========

const form = document.getElementById("bmi-form");
//button to show the BMI checker form
const bmiCheckerButton = document.getElementById("bmi-checker");
bmiCheckerButton.addEventListener("click", (event) => {
   
   event.preventDefault(); 
   
   form.style.display = "block"; // Show the form when the button is clicked

});
//Creation of the form that will take the weight and height of the user and send it to the backend for BMI calculation


form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const weight = Number(document.getElementById("weight").value);
    const height = Number(document.getElementById("height").value);
    if (!weight || !height) {
        alert("Please enter valid weight and height values.");
        form.querySelector("button").disabled = false;
        form.querySelector("button").textContent = "Calculate BMI";
        return;
    }
    await CalculateBMI(weight, height);
});


const CalculateBMI = async (weight_kg, height_m) => {
    
    const response = await fetch(`${API_BASE}/api/calculate_bmi?weight_kg=${weight_kg}&height_m=${height_m}`,
        {method:"POST"}
    );
    if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    const html = `<p>Your BMI is: ${result.bmi}</p><br><p>BMI Category: ${result.category}</p>`;
    document.getElementById("bmi-result").innerHTML = html;
}

//======= A seamless calculator operation that listens to the button clicked and uses its id to form operations
const calculator = document.getElementById("calculator");
calculator.addEventListener("click", async (event) => {
    event.preventDefault();
    const button = event.target.closest("button[id]");
    if (!button) return;
    const operation = button.id;
    const aInput = Number(document.getElementById("calc-a").value.trim());
    const bInput = Number(document.getElementById("calc-b").value.trim());
    if (!aInput || !bInput) {
        alert("Please enter valid values for both fields.");
        return;
    }

    if (operation === "square_root"){
        alert("Square root operation only requires the first number. The second number will be ignored.");
        return;
    }
    await calculate(operation, aInput, bInput);
    
});

//Operation ID  fetches the correct backend API to perform the task
async function calculate(operation,a,b) {
    const params = new URLSearchParams({a: String(a)});
    if (operation !== "square_root") {
        params.set("b", String(b));
    }
    //API matches the name of operation with the right URL
    const response = await fetch(`${API_BASE}/api/${operation}?${params.toString()}`, {method: "POST"});
    const result = await response.json();
    const output = document.getElementById("calculator-result");
    
    if (!response.ok) {
        output.textContent = result.detail ?? "Calculation failed."
        return;
    }
    output.textContent = `Result: ${result.Result}`
}


document.addEventListener("DOMContentLoaded", () => {
    loadAndDisplayTable();
    const weight = Number(document.getElementById("weight").value);
    const height = Number(document.getElementById("height").value);
    if (weight && height) {
        CalculateBMI(weight, height)
    };

});