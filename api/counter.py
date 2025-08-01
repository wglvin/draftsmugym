# counter.py
from flask import Flask, jsonify
import pandas as pd
from datetime import datetime, timedelta
from flask_cors import CORS

GOOGLE_SHEET_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTGjYeAiT6NmupmUoyv9iuAgn7eCEcmkPfxXdy7MfCUHMb_JucMta7ba-95ulPa1Fk-eoKEWJvu3GJQ/pub?gid=0&single=true&output=csv"
TIMEZONE_OFFSET = 8  # Singapore time

app = Flask(__name__)
CORS(app) 

def get_current_slot():
    slots = [
        "8:30 am", "9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am",
        "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm", "2:00 pm",
        "2:30 pm", "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm",
        "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm"
    ]
    now = datetime.utcnow() + timedelta(hours=TIMEZONE_OFFSET)
    for s in reversed(slots):
        slot_time = datetime.strptime(s, '%I:%M %p').replace(year=now.year, month=now.month, day=now.day)
        if now >= slot_time:
            return s
    return slots[0]

def normalize_slot(slot):
    # Converts "8:30 am" to "08:30"
    dt = datetime.strptime(slot, "%I:%M %p")
    return dt.strftime("%H:%M")

@app.route('/api/counter')
def crowd_level():
    df = pd.read_csv(GOOGLE_SHEET_CSV)
    slot = get_current_slot()
    normalized_slot = normalize_slot(slot)
    try:
        # Match after stripping whitespace
        row = df[df["Time"].astype(str).str.strip() == normalized_slot]
        n_people = int(row["Number of people"].values[0])
    except Exception as ex:
        print(f"Exception: {ex}")
        n_people = "?"
    return jsonify({"crowd": f"{n_people} / 50", "slot": slot})

if __name__ == "__main__":
    app.run(debug=True)
