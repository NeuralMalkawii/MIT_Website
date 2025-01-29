import random
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import websockets
import uvicorn
import socket
import asyncio

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

template = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return template.TemplateResponse("index.html", {"request": request})


@app.get("/bicep", response_class=HTMLResponse)
async def home(request: Request):
    return template.TemplateResponse("bicep-curl.html", {"request": request})


@app.get("/pushup", response_class=HTMLResponse)
async def home(request: Request):
    return template.TemplateResponse("pushup.html", {"request": request})


@app.get("/api/data")
async def get_data():
    return {"data": "Hello World"}


@app.websocket("/ws/heart-rate")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        heart_rate = random.randint(80, 90)
        await websocket.send_text(str(heart_rate))
        await asyncio.sleep(1)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    ESP_IP = "172.20.10.3"
    ESP_PORT = 8000
    await websocket.accept()
    print("Websocket client connected")
    if websocket.url.path == "/ws":
        try:
            # Create a socket
            client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            client_socket.settimeout(2.0)
            client_socket.connect((ESP_IP, ESP_PORT))
            print("Connected to ESP32")
            while True:
                try:
                    response = client_socket.recv(1024).decode()
                    print("Response from ESP: ", response)
                    if response[-1] != "\n":
                        print("Response from ESP: ", response)
                        await websocket.send_text(response)
                except Exception as e:
                    print("Error", e)
                    break
        except Exception as e:
            print("ESP Connection Error", e)
        finally:
            await websocket.close()
            client_socket.close()
            print("Websocket client disconnected")


if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

# import socket
# from asyncio import sleep

# # ESP's IP address and port (replace with actual IP from ESP's Serial Monitor)


# # Receive response
