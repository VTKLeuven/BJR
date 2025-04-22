import subprocess
import time

PROXMARK_PATH = "./proxmark3"  # ✅ If the binary is in the same folder
PORT = "/dev/tty.usbmodem144101"
last_uid = None

def read_iso14443a_tag():
    try:
        result = subprocess.run(
            [PROXMARK_PATH, PORT],
            input="hf 14a reader\nquit\n",
            text=True,
            capture_output=True,
            timeout=1.4
        )

        for line in result.stdout.splitlines():
            if "UID:" in line:
                uid = line.split("UID:")[1].strip().replace(" ", "")
                return uid

    except subprocess.TimeoutExpired:
        pass  # Skip and try again
    except Exception as e:
        print(f"❌ Error: {e}")
    return None

# Main loop
while True:
    uid = read_iso14443a_tag()
    if uid and uid != last_uid:
        print(f"🎯 Fast ISO14443-A Tag Detected: {uid}")
        last_uid = uid
    time.sleep(0.3)
