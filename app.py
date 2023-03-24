from flask import Flask , request, render_template,jsonify
import json
from flask_cors import CORS, cross_origin
import numpy as np
from logic import Logic


app = Flask(__name__) 
app.secret_key = "secret key"
CORS(app)


logic = Logic()

output= [0]
allpasszeros, allpasspoles= [],[]
filterangles, finalAngles, allPassAngles= [0],[0],[0]
totalzeros, totalpoles= [0],[0]


 
 
@app.route('/', methods= ['GET','POST'])
def home():
    return render_template('index.html')



@app.route('/getFilter', methods=['POST'])
@cross_origin()
def getFrequencyResponce():
    global filterangles, allPassAngles, totalzeros, totalpoles
    if request.method == 'POST':
        zerosAndPoles = json.loads(request.data)
        logic.zeros = logic.parseToComplex(zerosAndPoles['zeros'])
        logic.poles = logic.parseToComplex(zerosAndPoles['poles'])
        logic.gain = zerosAndPoles['gain']
        w, filterangles, magnitude = logic.frequencyResponse()
        filterangles= np.add(allPassAngles, filterangles)
    
        response_data = {
                'w': w.tolist(),
                'angels': filterangles.tolist(),
                'magnitude': magnitude.tolist()
            }
        zero,pole,k= logic.getfrompair()
        totalzeros= zero+allpasszeros
        totalpoles= pole+allpasspoles
    return jsonify(response_data)


@app.route('/getZerosAndPoles', methods=['POST'])
@cross_origin()
def getPoints():
    if request.method == 'POST':
        zerosAndPoles = json.loads(request.data)
        logic.zeros = zerosAndPoles['zeros']
        logic.poles = zerosAndPoles['poles']
        response_data = {
                'zeros': logic.zeros,
                'poles': logic.poles,
            }
        print(response_data)
    return jsonify(response_data)

@app.route('/getAllPassFilter', methods=['POST', 'GET'])
def getAllPassFilterData():
    count=0
    if request.method == 'POST':
        data = json.loads(request.data)
        logic.allPassCoeffients = data['a']
        for a in logic.allPassCoeffients:
            logic.allPassCoeffients[count]= logic.convert(a)
            count+=1
        w, filter_angles = logic.getAllPassFrequencyResponse()
        response_data = {
            'w': w.tolist(),
            'angels': filter_angles.tolist(),
        }
        return jsonify(response_data)
    else:
        return 'There is no Post request'

@app.route('/getFinalFilter', methods=['POST', 'GET'])
@cross_origin()
def getFinalFilter():
    global finalAngles, allPassAngles
    count=0
    if request.method == 'POST':
        #change= True
        zerosAndPoles = json.loads(request.data)
        logic.zeros = logic.parseToComplex(zerosAndPoles['zeros'])
        logic.poles = logic.parseToComplex(zerosAndPoles['poles'])
        logic.gain = 1

        a = zerosAndPoles['a']
        logic.allPassCoeffients= len(a)*[0]
        for a in a:
            logic.allPassCoeffients[count]= logic.convert(a)
            count+=1
        allpasszeros, allpasspoles= len(logic.allPassCoeffients)*[0], len(logic.allPassCoeffients)*[0]
        if a!=[]:        
            for cnt in range(0,len(logic.allPassCoeffients)):
                coefficient= logic.allPassCoeffients[cnt]
                allpasszeros[cnt], allpasspoles[cnt]= logic.getzeroandpole(coefficient)

        w, allPassAngles = logic.getAllPassFrequencyResponse()
        w, filterAngels, filterMagnitude = logic.frequencyResponse()

        finalAngles = np.add(allPassAngles, filterAngels)
        finalMagnitude = filterMagnitude*1

        response_data = {
               'w': w.tolist(),
               'angels': finalAngles.tolist(),
               'magnitude': finalMagnitude.tolist()
            }
    return jsonify(response_data)

@app.route('/applyFilter', methods=['GET','POST'])
@cross_origin()
def filtered_signal():
    global output
    if request.method == 'POST':
        unfiltered_signal = json.loads(request.data)      #this converts the json output to a python dictionary
        key= list(unfiltered_signal.keys())[0]
        print(totalzeros)
        logic.zeros=totalzeros
        logic.poles=totalpoles
        output = logic.apply_filter(signal=unfiltered_signal.get(key))
        response_signal = {
                'output': (output).tolist()
            } 

        print(totalzeros)
    return jsonify(response_signal)


if __name__ == '__main__':
    app.run(debug=True, port=8000)

