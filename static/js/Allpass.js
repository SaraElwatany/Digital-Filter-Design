const allPassPhase = document.getElementById('all-pass-phase-response');
const finalPhase = document.getElementById('final-filter-phase-response');
const checkList = document.getElementById('list1')
document.querySelector('#listOfA').addEventListener('input', updateAllPassCoeff)
document.querySelector('#new-all-pass-coef').addEventListener('click', addNewA)


function addNewA() {
    var newA_real = document.getElementById('real').value
    var newA_img = document.getElementById('imaginary').value
    var newA = math.complex(newA_real,newA_img)
    console.log(newA)
    // if(newA > 1 || newA < -1){
    //     alert(`invalid ${newA} as Filter Coefficient`)
    //     return
    // }
    document.getElementById(
        'listOfA'
    ).innerHTML += `<li><input class = "target1" type="checkbox" data-avalue="${newA}"/>${newA}</li>`
    clearCheckBoxes()
}

async function updateFilterPhase(allPassCoeff){
    const { zeros, poles } = filter_plane.getZerosPoles(radius)
    const { angels: allPassAngels } = await postData(
        'http://127.0.0.1:8000//getAllPassFilter',
        {
            a: allPassCoeff,
        }
    )
    const { w, angels: finalFilterPhase } = await postData(
        'http://127.0.0.1:8000//getFinalFilter',
        {
            zeros,
            poles,
            a: allPassCoeff,
        }
    )
    Plotly.newPlot(
        allPassPhase,
        [{x: w, y: allPassAngels}],
        {
            paper_bgcolor:"#efefef",
            plot_bgcolor:"#efefef",
            autosize: false,
            width:600,
            height:250,

            margin: {
              l: 40,
              r: 0,
              b: 20,
              t: 10,
              pad: 0
            }
        },      
      
       { staticPlot: true })



    Plotly.newPlot(
        finalPhase,
        [{x: w, y: finalFilterPhase}],
        {
            paper_bgcolor:"#f4f4f4",
            plot_bgcolor:"#f4f4f4",
            autosize: false,
            width:600,
            height:250,

            margin: {
              l: 30,
              r: 0,
              b: 20,
              t: 10,
              pad: 0
            }
        },
               { staticPlot: true })   
   
}

function updateAllPassCoeff(){
    let allPassCoeff = []
    document.querySelectorAll('.target1').forEach(item => {
        let aValue = (item.dataset.avalue)
        console.log(aValue)
        let checked = item.checked
        if (checked) allPassCoeff.push(aValue)
    })
    updateFilterPhase(allPassCoeff)
}