import numpy as np
import scipy
import scipy.signal

class Logic():
    def __init__(self) -> None:
        self.zeros=[]
        self.poles=[]
        self.gain = 0.5
        self.allPassCoeffients= []

    def frequencyResponse(self):
        # w is The frequencies at which h was computed. By default, w is normalized to the range [0, pi).
        # h is The frequency response, as complex numbers.
        w, h = scipy.signal.freqz_zpk(self.zeros, self.poles, self.gain)
        magnitude = 20 * np.log10(np.abs(h))
        angels = np.unwrap(np.angle(h))
        #normalization
        w=w/max(w)
        # rounding 
        angles=np.around(angels, decimals=3)
        magnitude= np.around(magnitude, decimals=3)
        return w,angles,magnitude

    # convert zeros and poles to complex numbers
    def parseToComplex(self,pairs):
        complexNumbers = [0]*len(pairs)
        for i in range(len(pairs)):
            x = round(pairs[i][0], 2)
            y = round(pairs[i][1], 2)
            complexNumbers[i] = x+ y*1j
        return complexNumbers



    def phaseResponse(self,a):
        w, h = scipy.signal.freqz([-a, 1.0], [1.0, -a])
        angels = np.zeros(512) if a==1 else np.unwrap(np.angle(h))
        w=w/max(w)
        angles=np.around(angels, decimals=3)
        return w,angles
        
        
    def getAllPassFrequencyResponse(self):
            filter_angles = np.zeros(512)
            w = np.zeros(512)
            for coeffient in self.allPassCoeffients:
                w, angles = self.phaseResponse(coeffient)
                filter_angles = np.add(filter_angles, angles)
            return w, filter_angles



    # Applying the filter to the signal
    def apply_filter(self, signal):
        b, a= scipy.signal.zpk2tf(self.zeros, self.poles, self.gain)
        output= scipy.signal.lfilter(b, a, signal)
        return output.real



    # Get zeros and poles from upper circle
    def getfrompair(self):
        zero= (int(len(self.zeros)/2))*[0]
        pole= (int(len(self.poles)/2))*[0]
        k= self.gain
        if len(self.zeros)==1:
            zero=self.zeros
        if len(self.poles)==1:
            pole=self.poles 
        cnt1,cnt2= 0,0
        for z in self.zeros: 
            check= np.sign(z.imag)
            if check!= -1:
                zero[cnt1]= z
                cnt1+=1
        for p in self.poles: 
            check= np.sign(p.imag)
            if check!= -1:
                pole[cnt2]= p
                cnt2+=1
        return zero,pole,k


    def getzeroandpole(self,a):
        zero= 1/np.conj(a)
        pole= a
        return zero,pole


    # Convert string to complex
    def convert(self,a):
        a = a.replace(' ', '')
        validcomplex= a.replace("i", "j") 
        converted_a = complex(validcomplex)
        return converted_a