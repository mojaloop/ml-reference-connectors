import cv2
# Mock implementation of GPIOSimulator for simulation purposes
class MockGPIO:
    BCM = "BCM"
    OUT = "OUT"
    IN = "IN"


    @staticmethod
    def setmode(mode):
        print(f"GPIO mode set to {mode}")


    @staticmethod
    def setup(pin, mode):
        print(f"GPIO pin {pin} set to mode {mode}")


    @staticmethod
    def output(pin, state):
        print(f"GPIO pin {pin} output set to {state}")


    @staticmethod
    def input(pin):
        return 0  # Simulate no signal


    @staticmethod
    def cleanup():
        print("GPIO cleanup called")


GPIO = MockGPIO
import time
import json
import logging
from threading import Thread


# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# GPIO pins setup
GPIO.setmode(GPIO.BCM)
motor_pins = [17, 23, 24, 25]
trig = 22
echo = 27


for pin in motor_pins:
    GPIO.setup(pin, GPIO.OUT)
GPIO.setup(trig, GPIO.OUT)
GPIO.setup(echo, GPIO.IN)


# Camera initialization
camera = cv2.VideoCapture(0)


# Constants
HSV_RANGES = {
    "red": [([0, 100, 100], [10, 255, 255]), ([170, 100, 100], [180, 255, 255])],
    "yellow": [([20, 100, 100], [30, 255, 255])],
    "blue": [([110, 100, 100], [130, 255, 255])]
}


# Function to clean up GPIO and release resources
def clean_up():
    GPIO.cleanup()
    camera.release()
    cv2.destroyAllWindows()


# Function to control motor states
def control_motors(state):
    for pin, s in zip(motor_pins, state):
        GPIO.output(pin, s)


# Obstacle avoidance logic
def avoid_obstacle():
    GPIO.output(trig, True)
    time.sleep(0.00001)
    GPIO.output(trig, False)


    start_time = time.time()
    while GPIO.input(echo) == 0:
        start_time = time.time()
    while GPIO.input(echo) == 1:
        stop_time = time.time()


    elapsed_time = stop_time - start_time
    distance = (elapsed_time * 34300) / 2


    if distance < 20:
        logging.info(f"Obstacle detected at {distance} cm. Avoiding.")
        # Stop motors and turn
        control_motors([0, 0, 0, 0])
        control_motors([1, 0, 0, 1])  # Turn right
        time.sleep(0.5)
        control_motors([1, 0, 1, 0])  # Move forward
    return distance


# Function to process colors in a frame
def process_colors(frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    masks = {}
    for color, ranges in HSV_RANGES.items():
        mask = None
        for lower, upper in ranges:
            temp_mask = cv2.inRange(hsv, tuple(lower), tuple(upper))
            mask = cv2.bitwise_or(mask, temp_mask) if mask is not None else temp_mask
        masks[color] = mask
    return masks


# Save map data to JSON
def save_map_data(coords):
    try:
        with open("map_data.json", "w") as file:
            json.dump(coords, file)
        logging.info("Map data saved.")
    except Exception as e:
        logging.error(f"Error saving map data: {e}")


# Load map data from JSON
def load_map_data():
    try:
        with open("map_data.json", "r") as file:
            return json.load(file)
    except FileNotFoundError:
        logging.warning("Map data file not found.")
        return None


# Function to move robot based on contour detection
def move_to_block(frame, mask):
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    for contour in contours:
        if cv2.contourArea(contour) > 100:
            x, y, w, h = cv2.boundingRect(contour)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            frame_center_x = frame.shape[1] / 2
            block_center_x = x + w / 2
            if block_center_x < frame_center_x - 50:
                control_motors([0, 1, 1, 0])  # Turn left
            else:
                control_motors([1, 0, 1, 0])  # Move forward
            distance = avoid_obstacle()
            if distance < 10:
                control_motors([0, 0, 0, 0])  # Stop
                return True
    return False


# Main function
def main():
    try:
        while True:
            ret, frame = camera.read()
            if not ret:
                logging.error("Failed to capture frame.")
                break


            masks = process_colors(frame)
            for color, mask in masks.items():
                if move_to_block(frame, mask):
                    logging.info(f"Block of color {color} moved to hospital.")
           
            cv2.imshow("Frame", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    except KeyboardInterrupt:
        logging.info("Exiting due to keyboard interrupt.")
    finally:
        clean_up()


if __name__ == "__main__":
    main()
