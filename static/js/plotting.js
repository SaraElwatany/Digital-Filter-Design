const filterDesignMagnitude = document.querySelector('#filter-mag-response')
const filterDesignPhase = document.querySelector('#filter-phase-response')


async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    return response.json()
}

async function updateFilterDesign(data) {
    data.gain = 1
    let { w, angels, magnitude } = await postData(`${API}/getFilter`, data)
   Plotly.newPlot(
        filterDesignMagnitude,
        [{ x: w, y: magnitude, line: { color: 'red' } } ],
        {
            paper_bgcolor:"#efefef",
            plot_bgcolor:"#efefef",
            autosize: false,
            width:400,
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
        
    Plotly.newPlot(
        filterDesignPhase,
        [{ x: w, y: angels, line: { color: 'red' } }, ],
        {
            paper_bgcolor:"#f4f4f4",
            plot_bgcolor:"#f4f4f4",
            autosize: false,
            width:400,
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



async function applyfilter(data) {
    let { output } = await postData(`${API}/applyFilter`, data)
    return output
}
