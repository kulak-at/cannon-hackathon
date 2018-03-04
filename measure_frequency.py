import pyaudio
import numpy as np
import matplotlib.animation as animation
import matplotlib.pyplot as plt

CHUNK = 2**11
RATE = 44100

p=pyaudio.PyAudio()
stream=p.open(format=pyaudio.paInt16,channels=2,rate=RATE,input=True,
              frames_per_buffer=CHUNK)



def animate(i, line, stream, wf, MAX_y):

    N = max(stream.get_read_available() / nFFT, 1) * nFFT
    data = stream.read(N)

    y = np.array(struct.unpack("%dh" % (N * CHANNELS), data)) / MAX_y
    y_R = y[1::2]

    Y_R = np.fft.fft(y_R, nFFT)


    line.set_ydata(Y_R)
    return line,


for i in range(int(10*44100/1024)): #go for a few seconds
    data = np.fromstring(stream.read(CHUNK),dtype=np.int16)
    peak=np.average(np.abs(data))*2
    bars=int(50*peak/2**16)
    print("%04d %05d %s"%(i,peak,bars))

stream.stop_stream()
stream.close()
p.terminate()