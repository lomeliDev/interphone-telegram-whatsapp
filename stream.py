import cv2
import websocket
import _thread
import time
import os
import sys
import base64
from dotenv import dotenv_values
config = dotenv_values(".env")

class Stream:

    def __init__(self, PORT_STREAMING, KEY_STREAMING, CAMERA):
        self.PORT_STREAMING = PORT_STREAMING
        self.KEY_STREAMING = KEY_STREAMING
        self.CAMERA = CAMERA
        self.ID_CAMERA = self.getCamera()
        self.camera = None
        self.ws = None
        self.statusStream = False
        self.statusPhoto = False
        self.statusVideo = False
        self.roundsVideo = 0
        self.out = None
        self.pathPhoto = os.getcwd() + "/data/camera.jpg"
        self.pathVideo = os.getcwd() + "/data/camera.mp4"

    def getCamera(self):
        idCamera = 999
        if self.CAMERA == "webcam":
            idCamera = 0
        if self.CAMERA == "native":
            idCamera = 1
        return idCamera

    def clear(self):
        self.statusStream = False
        self.statusPhoto = False
        self.statusVideo = False
        self.roundsVideo = 0
        if self.camera != None:
            try:
                self.camera.release()
                self.camera = None
            except:
                pass
        if self.out != None:
            try:
                self.out.release()
                self.out = None
            except:
                pass

    def run(self):
        if self.ID_CAMERA != 999:
            websocket.enableTrace(False)
            self.ws = websocket.WebSocketApp("ws://localhost:" + self.PORT_STREAMING,
                                        on_open=self.on_open,
                                        on_message=self.on_message,
                                        on_error=self.on_error,
                                        on_close=self.on_close)
            self.ws.run_forever()
        else:
            print("You must select a camera")

    def on_message(self, ws, message):
        if message == "STOP_STREAM":
            self.clear()
        if message == "START_STREAM":
            try:
                self.clear()
                self.camera = cv2.VideoCapture(self.ID_CAMERA)
                self.statusStream = True
            except:
                self.clear()
        if message == "START_PHOTO":
            try:
                if self.statusStream == True and self.camera != None:
                    self.statusPhoto = True
                else:
                    self.clear()
                    self.camera = cv2.VideoCapture(self.ID_CAMERA)
                    self.statusPhoto = True
            except:
                self.clear()
        if message == "START_VIDEO":
            try:
                if self.statusStream == True and self.camera != None:
                    self.roundsVideo = 0
                    self.statusVideo = True
                else:
                    self.clear()
                    self.camera = cv2.VideoCapture(self.ID_CAMERA)
                    self.roundsVideo = 0
                    self.statusVideo = True
            except:
                self.clear()

    def on_error(self, ws, error):
        self.clear()

    def on_close(self, ws, close_status_code, close_msg):
        self.clear()
        time.sleep(3)
        self.run()

    def on_open(self, ws):

        def setStream():
            while True:
                try:
                    ws.send("SET_STREAM|" + self.KEY_STREAMING)
                    time.sleep(10)
                except:
                    time.sleep(10)
                    pass

        def stream():
            while True:
                if self.statusStream == True and self.camera != None:
                    try:
                        while self.statusStream == True:
                            success, frame = self.camera.read()
                            if not success:
                                break
                            else:
                                ret, buffer = cv2.imencode('.jpg', frame)
                                jpg_as_text = base64.b64encode(buffer)
                                ws.send(jpg_as_text)
                                if self.statusPhoto == True:
                                    cv2.imwrite(self.pathPhoto, frame)
                                    self.statusPhoto = False
                                if self.statusVideo == True:
                                    if self.roundsVideo == 0:
                                        frame_width = int(self.camera.get(3))
                                        frame_height = int(self.camera.get(4))
                                        self.out = cv2.VideoWriter(self.pathVideo, cv2.VideoWriter_fourcc(*'H264'), 20.0, (frame_width,frame_height))
                                    self.roundsVideo += 1
                                    self.out.write(frame)
                                    if self.roundsVideo >= 200:
                                        try:
                                            self.out.release()
                                        except:
                                            pass
                                        self.statusVideo = False
                                time.sleep(0.1)
                    except:
                        self.clear()
                        time.sleep(3)
                elif self.statusPhoto == True and self.camera != None:
                    try:
                        while self.statusPhoto == True:
                            success, frame = self.camera.read()
                            if not success:
                                break
                            else:
                                ret, buffer = cv2.imencode('.jpg', frame)
                                cv2.imwrite(self.pathPhoto, frame)
                                self.clear()
                    except:
                        self.clear()
                        time.sleep(3)
                elif self.statusVideo == True and self.camera != None:
                    try:
                        frame_width = int(self.camera.get(3))
                        frame_height = int(self.camera.get(4))
                        out = cv2.VideoWriter(self.pathVideo, cv2.VideoWriter_fourcc(*'H264'), 20.0, (frame_width,frame_height))
                        while self.statusVideo == True:
                            success, frame = self.camera.read()
                            if not success:
                                break
                            else:
                                self.roundsVideo += 1
                                out.write(frame)
                                if self.roundsVideo >= 200:
                                    self.clear()
                                    self.statusVideo = False
                        try:
                            out.release()
                        except:
                            pass
                    except:
                        self.clear()
                        time.sleep(3)
                else:
                    time.sleep(3)

        _thread.start_new_thread(setStream, ())
        _thread.start_new_thread(stream, ())

    def main(self):
        try:
            self.run()
        except KeyboardInterrupt:
            print("Application finished (Keyboard Interrupt)")
            self.clear()
            sys.exit("Manually Interrupted")
        except Exception:
            print("Oh no, something bad happened! Restarting...")
            self.clear()
            sys.exit("Manually Interrupted")


def main():
    stream = Stream(config['PORT_STREAMING'], config['KEY_STREAMING'], config['CAMERA'])
    stream.main()

if __name__ == "__main__":
    main()