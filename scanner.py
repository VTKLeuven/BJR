from smartcard.CardMonitoring import CardMonitor, CardObserver
from smartcard.util import toHexString
from smartcard.Exceptions import CardConnectionException, NoCardException
import time
from pynput.keyboard import Controller, Key

keyboard = Controller()


class UIDObserver(CardObserver):
    def update(self, observable, actions):
        (added_cards, removed_cards) = actions
        for card in added_cards:
            print("Card inserted")
            connection = card.createConnection()

            for attempt in range(3):  # Try up to 3 times
                try:
                    connection.connect()
                    get_uid_command = [0xFF, 0xCA, 0x00, 0x00, 0x00]
                    data, sw1, sw2 = connection.transmit(get_uid_command)
                    if sw1 == 0x90 and sw2 == 0x00:
                        uid_str = ''.join([f"{byte:02X}" for byte in data])
                        print(f"Card UID: {uid_str}")

                        # Faster typing (0.05s delay, but with a small buffer time)
                        for char in uid_str:
                            keyboard.press(char)
                            keyboard.release(char)
                            time.sleep(0.05)  # Reduced delay (50ms)

                        # Ensure a slight pause before pressing Enter
                        time.sleep(0.1)  # Small buffer before submitting

                        # Press Enter (form submission)
                        keyboard.press(Key.enter)
                        keyboard.release(Key.enter)
                        print("Submitted UID (Enter pressed).")
                    else:
                        print("Failed to read UID.")
                    break  # Success, break retry loop
                except NoCardException:
                    print(f"Card not ready yet (attempt {attempt + 1}), retrying...")
                    time.sleep(0.1)
                except CardConnectionException as e:
                    print(f"Connection failed: {e}")
                    break


def main():
    card_monitor = CardMonitor()
    card_observer = UIDObserver()
    card_monitor.addObserver(card_observer)
    print("Monitoring for cards. Press Ctrl+C to exit.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        card_monitor.deleteObserver(card_observer)
        print("Exiting.")


if __name__ == "__main__":
    main()