# run "pip install pynput" op voorhand
import subprocess
import re
import time
from pynput.keyboard import Controller

def get_card_uid():
    try:
        result = subprocess.run(
            ['proxmark3', '/dev/ttyACM0', 'hf', 'search'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        output = result.stdout
        print("Raw Proxmark3 Output:\n", output)

        match = re.search(r'UID:\s+([0-9A-Fa-f\s]+)', output)
        if match:
            uid = match.group(1).strip().replace(' ', '')
            print("Card UID:", uid)
            return uid
        else:
            print("UID not found.")
            return None

    except Exception as e:
        print("Error:", e)
        return None

def type_uid(uid):
    keyboard = Controller()
    time.sleep(2)  # Optional: Time to focus the input field
    keyboard.type(uid)  # Simulate typing the UID
    keyboard.press('\n')  # Optionally press Enter
    keyboard.release('\n')

uid = get_card_uid()
if uid:
    type_uid(uid)