from flask import Flask, jsonify
import pandas as pd
import requests
from datetime import datetime, timedelta

EXCEL_URL = "https://smu-my.sharepoint.com/personal/sylee_smu_edu_sg/_layouts/15/download.aspx?share=EX2yVsFv1A1BnNh0D7Ih7EkBIc_hBhB7tVDk4y0Srn3KgA"  # must be direct download link
TIMEZONE_OFFSET = 8  # GMT+8

app = Flask(__name__)

def get_current_slot():
    # Time slot list must match the Excel
    slots = [
        "8:30 am", "9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am",
        "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm", "2:00 pm", 
        "2:30 pm", "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm", 
        "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm"
    ]
    now = datetime.utcnow() + timedelta(hours=TIMEZONE_OFFSET)
    # find nearest previous slot
    for s in reversed(slots):
        slot_time = datetime.strptime(s, '%I:%M %p').replace(
            year=now.year, month=now.month, day=now.day)
        if now >= slot_time:
            return s
    return slots[0]  # fallback to first slot

@app.route('/crowd-level')
def crowd_level():
    # Download and load Excel with pandas
    r = requests.get(EXCEL_URL)
    df = pd.read_excel(r.content, sheet_name="For the website")
    slot = get_current_slot()
    try:
        row = df[df["Time"] == slot]
        n_people = int(row["Number of people"].values[0])
    except Exception:
        n_people = "?"
    return jsonify({"crowd": f"{n_people} / 50", "slot": slot})

if __name__ == "__main__":
    app.run()
