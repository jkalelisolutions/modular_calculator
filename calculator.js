const API_BASE = "http://127.0.0.1:8000";

const LoadCheckins = async () => {
    const response = await fetch(`${API_BASE}/api/checkin`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

//Post a New Checkin
const SubmitCheckin = async (Payload) => {
    const response = await fetch(`${API_BASE}/api/chekin`,{
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body:JSON.stringify(Payload)
    });
    if (!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const CalculateBMI = async (weight,height)=> {
    const params = URLSearchParams({
        weight: weight,
        height: height
    });
    const response = await fetch(`${API_BASE}/api/calculate_bmi?${params.toString()}`,
        {method:"POST"}
    );
    if(!response.ok){
        throw new Error(``)
    }
}