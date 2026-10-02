import math
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from datetime import date

app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
checkin=[]
class checkins(BaseModel):
    height: int
    weight: int
    bmi: str

@app.get("/")
def home():
    return{"Status Response: 200"
           "Calculator API is running."}

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
     
    
     data["BMI_Records"].append(category)
     with open("calculator.json","w") as f:
         try:
             json.dump(data,f,indent=4)
             return {"bmi": res, "category": category}
         except json.JSONDecodeError:return {"Failed to store data. Try again later"}
     return {"bmi": res, "category": category}   
             
         
        

    
#======== Calculate Calorie Estimate : Default;0.04 ========
@app.get("/api/calories")
def estimate_calories(steps, calorie_per_step= 0.04):
    calories = steps*calorie_per_step
    return math.floor(calories)

#======== Check Step Goal ========
@app.get("/api/summary")
def weekly_step_summary(steps_list, goal=8000):
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
@app.get("/api/protocol")
def protocol_summary(plist):
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
def addition(a,b):
    sum = (a+b)
    return {"Result":sum}

@app.post("/api/subtraction")
def subtraction(a,b):
    sub = (a-b)
    return {"Result":sub}

@app.post("/api/multiplication")
def multiplication(a,b):
    mult = (a*b)
    return {"Result":mult}

@app.post("/api/division")
def division(a,b):
    if b == 0:
        raise HTTPException(status_code=400, detail="Division by zero is not allowed.")
    div = (a/b)
    return {"Result":div}

@app.post("/api/square_root")
def square_root(a):
    if a < 0:
        raise HTTPException(status_code=400, detail="Square root of negative number is not allowed.")
    
    return {"Result": math.sqrt(a)}

@app.post("/api/percentage")
def percentage(a,b,y=100):
    return {"Result": (a*b/y)}

@app.post("/api/power_of")
def power_of(a,b):
    return {"Result": (a**b)}

#======== The REP Estimator =======
@app.post("/api/rep_estimator")
def one_rep_estimator(weight_kg, r):
    return {"Result": round(weight_kg*(1+r/30),2)}
