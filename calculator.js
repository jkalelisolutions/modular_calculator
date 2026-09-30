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
                    <th style="padding: 8px; border: 1px solid #241818;">BMI Category</th>
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

const CalculateBMI = async (weight_kg,height_m)=> {
    const params = URLSearchParams({
        weight: weight_kg,
        height: height_m
    });
    const response = await fetch(`${API_BASE}/api/calculate_bmi?${params.toString()}`,
        {method:"POST"}
    );
    if(!response.ok){
        throw new Error(``)
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadAndDisplayTable();
});