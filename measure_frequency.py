import pyaudio
import struct
import numpy as np
import websockets
import asyncio

CHUNK = 2**11
RATE = 44100
nFFT = 6
BUF_SIZE = 4 * nFFT
SAMPLE_SIZE = 2
CHANNELS = 2
MAX_y = 2.0 ** (SAMPLE_SIZE * 8 - 1)

p = pyaudio.PyAudio()
streamGlobal=p.open(format=pyaudio.paInt16,channels=2,rate=RATE,input=True,
              frames_per_buffer=CHUNK)


frequency_threshold = [
    {"start": 60, "end": 250}, {"start": 250, "end": 500}, {"start": 500, "end": 2000},
    {"start": 2000, "end": 4000}, {"start": 4000, "end": 6000}, {"start": 6000, "end": 20000}]


def animate(stream, MAX_y):
    n = int(max(stream.get_read_available() / nFFT, 1) * nFFT)
    data = stream.read(n)
    y = np.array(struct.unpack("%dh" % (n * CHANNELS), data)) / MAX_y
    y_R = y[1::2]
    Y_R = abs(np.fft.fft(y_R, nFFT))

    print(Y_R / 6)
    return
    # fft = Y_R[:int(len(Y_R)/2)]
    # print(fft)
    freq_initial = np.fft.fftfreq(CHUNK, 1.0/RATE)
    freq = freq_initial[:int(len(freq_initial) / 2)]


    print(np.mean(freq[np.where(freq < 2000)]))


async def hello(websocket, path):
    greeting = "Hello socket, my old friend"
    print(greeting)

start_server = websockets.serve(hello, 'localhost', 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

for i in range(int(10*44100/1024)): #go for a few seconds
    animate(streamGlobal, MAX_y)




streamGlobal.stop_stream()
streamGlobal.close()
p.terminate()