import math
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from datetime import date

app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://modular-calculator.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

checkin=[]
class checkins(BaseModel):
    height: int
    weight: int
    bmi: str

class calories(BaseModel):
    steps: int

@app.get("/")
def home():
    return FileResponse("static/index.html")

@app.get("/api/checkin")
def load_checkins():
    if  os.path.exists("calculator.json"):
        
      with open("calculator.json", "r") as f:
        try: 
            data= json.load(f)
            if isinstance(data,dict):
                return data
        except json.JSONDecodeError:
            return {"Error loading file. Please try again later."
                    "Checking file location..."}
        pass
      return {"BMI_Records":[], "Protocol":[] ,"weekly_Report":[]}
    return {"BMI_Records":[], "Protocol":[] ,"weekly_Report":[]}
        
#======== Calculate Body Mass Index ========
@app.post("/api/calculate_bmi")
def calculate_bmi(weight_kg: float, height_m: float):
     
     data=load_checkins()
     if not isinstance(data,dict):
         data= {"BMI_Records":[]}
     if not isinstance(data.get("BMI_Records"),list):
         data["BMI_Records"]=[]
     bmi = weight_kg/((height_m/100)**2)
     res = round(bmi,1)
    
     if res < 18.5:
            category= "Underweight"
     elif res < 25:
            category= "Normal Weight"
     elif res < 30:
            category="Overweight"
     else:
            category= "Obese" 
     
     result = {"bmi": res, "category": category}
     data["BMI_Records"].append(result)
     with open("calculator.json","w") as f:
         try:
             json.dump(data,f,indent=4)
             return result
         except json.JSONDecodeError:return {"Failed to store data. Try again later"}
     return {"bmi": res, "category": category}  
             
         
        

    
#======== Calculate Calorie Estimate : Default;0.04 ========
@app.post("/api/calories")
def estimate_calories(request: calories):
    calories = request.steps * 0.04

    return {"calories": math.floor(calories)}
 
#======== Check Step Goal ========
@app.post("/api/summary")
def weekly_step_summary(steps_list: list, goal: int = 8000):
    new= load_checkins()
    if not isinstance(new,dict):
        new={"weekly_Report":[]}
    if not isinstance(new.get("weekly_Report"),list):
        new["weekly_Report"]=[]
    today = date.today().strftime(f"%d %b %y")
    days_hit = len([s for s in steps_list if s >= goal])
    average = round(sum(steps_list)/ len(steps_list),1)
    best = max(steps_list)
    worst = min(steps_list)
    summary = {"today":today,"days_hit":days_hit,"average":average,"best":best,"worst":worst}
    new["weekly_Report"].append(summary)
    with open("calculator.json","w") as f:
        json.dump(new,f,indent=4)
        return{"Status: 200"},{"Summary":summary}
    

#======== Check Protocol Summary ========
@app.post("/api/protocol")
def protocol_summary(plist: list):
    data=load_checkins()
    if not isinstance(data,dict):
        data={"Protocol":[]}
    if not isinstance(data.get("Protocol"),list):
        data["Protocol"]=[]
    unique = list(set(plist))
    summary = {}
    for p in unique:
        summary[p] = plist.count(p)
    data["Protocol"].append(summary)
    with open("calculator.json","w") as f:
        json.dump(data,f,indent=4)
    return {"Result": summary}

#======== Math calculations ========
@app.post("/api/addition")
def addition(a: float,b: float):
    return {"Result":(a+b)}

@app.post("/api/subtraction")
def subtraction(a: float,b: float):
    return {"Result": (a-b)}

@app.post("/api/multiplication")
def multiplication(a: float,b: float):
    return {"Result":(a*b)}

@app.post("/api/division")
def division(a: float,b: float):
    if b == 0:
        raise HTTPException(status_code=400, detail="Division by zero is not allowed.")
    return {"Result":(a/b)}

@app.post("/api/square_root")
def square_root(a:float):
    if a < 0:
        raise HTTPException(status_code=400, detail="Square root of negative number is not allowed.")
    return {"Result": math.sqrt(a)}

@app.post("/api/percentage")
def percentage(a: float,b: float,y: float=100):
    return {"Result": (a*b/y)}

@app.post("/api/power_of")
def power_of(a: float,b: float):
    return {"Result": (a**b)}

#======== The REP Estimator =======
@app.post("/api/rep_estimator")
def one_rep_estimator(weight_kg: float, r: float):
    return {"Result": round(weight_kg*(1+r/30),2)}
