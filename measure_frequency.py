import pyaudio
import struct
import numpy as np
import websockets
import asyncio
import json
import math

CHUNK = 2**11
RATE = 44100
nFFT = 512
BUF_SIZE = 4 * nFFT
SAMPLE_SIZE = 2
CHANNELS = 2
MAX_y = 2.0 ** (SAMPLE_SIZE * 8 - 1)

p = pyaudio.PyAudio()
streamGlobal=p.open(format=pyaudio.paInt16,channels=2,rate=RATE,input=True,
              frames_per_buffer=CHUNK)


frequency_threshold = [
    {"start": 60, "end": 250},
    {"start": 250, "end": 500},
    {"start": 500, "end": 2000},
    {"start": 2000, "end": 4000},
    {"start": 4000, "end": 6000},
    {"start": 6000, "end": 20000}]


def animate(stream, MAX_y):
    n = int(max(stream.get_read_available() / nFFT, 1) * nFFT)
    data = stream.read(n)
    y = np.array(struct.unpack("%dh" % (n * CHANNELS), data)) / MAX_y
    y_R = y[1::2]
    Y_R = abs(np.fft.fft(y_R, nFFT))
    li = []
    for n in frequency_threshold:
        nx = math.floor(n["start"]*nFFT/RATE)
        ny = math.ceil(n["end"]*nFFT/RATE)
        li.append(max(Y_R[nx:ny])*(ny-nx))
    return li

async def hello(websocket, path):
    greeting = "Hello socket, my old friend"

    print(greeting)
    while True:
        await websocket.send(json.dumps(animate(streamGlobal, MAX_y)))


start_server = websockets.serve(hello, '0.0.0.0', 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

for i in range(int(10*44100/1024)): #go for a few seconds
    animate(streamGlobal, MAX_y)




streamGlobal.stop_stream()
streamGlobal.close()
p.terminate()