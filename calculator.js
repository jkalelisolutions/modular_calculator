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
const bmiColumns = [
    { label: "#", value: (_, index) => index + 1 },
    {label: "BMI Value", value: record => record.bmi},
    { label: "BMI Category", value: record => record.category }
];

const weeklyColumns = [
    { label: "Date", value: record => record.today },
    { label: "Days Goal Hit", value: record => record.days_hit },
    { label: "Average", value: record => record.average },
    { label: "Best", value: record => record.best },
    { label: "Worst", value: record => record.worst }
];

// The renderer should build its headers and cells from these columns.
function renderTable(rows, containerId, columns) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        container.innerHTML = "<p>No records available.</p>";
        return;
    }

    const headers = columns
        .map(column => `<th>${column.label}</th>`)
        .join("");

    const body = rows.map((row, index) => `
        <tr>
            ${columns.map(column =>
                `<td>${column.value(row, index) ?? ""}</td>`
            ).join("")}
        </tr>
    `).join("");

    container.innerHTML = `
        <div class="table-scroll">
            <table>
                <thead><tr>${headers}</tr></thead>
                <tbody>${body}</tbody>
            </table>
        </div>
    `;
}

const weeklysummary = async (steps,goal)=> {
    const response = await fetch(`${API_BASE}/api/summary?steps=${steps}&goal=${goal}`,{
        method: "POST",
        headers: {"Content-Type":"application/json"}
    })
    
    if (!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

const loadAndDisplayTable = async () => {
    try {
        const data = await Checkin(); 
        // Assuming your backend returns {"BMI_Records": ["Overweight", "Normal Weight"]}
        renderTable(data.BMI_Records, "bmi-container", bmiColumns);
        renderTable(data.weekly_Report, "weekly-container", weeklyColumns);
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

const caloriechecker = document.getElementById("calorie-checker");
caloriechecker.addEventListener("click", async () => {
    const steps = Number(document.getElementById("steps").value);
    if (!steps) {
        alert("Please enter a valid number of steps.");
        return;
    }
    await checkCalories(steps);
});

const checkCalories = async (steps) => {
    const response = await fetch(`${API_BASE}/api/calories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ steps })
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    document.getElementById("calorie-result").textContent = `Calories burned: ${result.calories} kcal`;
};

document.addEventListener("DOMContentLoaded", () => {
    loadAndDisplayTable();
    const weight = Number(document.getElementById("weight").value);
    const height = Number(document.getElementById("height").value);
    if (weight && height) {
        CalculateBMI(weight, height)
    };

});