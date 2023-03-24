let canvas = document.getElementById("realtimecanvas");
let realtimechart1 = document.getElementById("chart1");
var flag1= false;
var flag2= false;
var time= [];
var timearray= [];
var realtimeX= [];
var realtimeY= [];
var amplitude= [];
var filteredsignal= [];
var newArray= [];
var drawfilter= [];
canvas.style.background = "#2f308f";
canvas.addEventListener("mousemove", mousemove);
// Define First Layout
var layout = {
    paper_bgcolor:"#f4f4f4",
    plot_bgcolor:"#f4f4f4",
    autosize: true, 
    margin: {
      l: 40,
      r: 0,
      b: 30,
      t: 30,
      pad: 0
    },
    xaxis: {title: "Time(ms)",titlefont: { size:10, color: 'black'},
        tickfont: {
            size: 10,
            color: 'black'}},
    yaxis: {
        //range: [2, 5],
        titlefont: { size:10, color: 'black' ,automargin:true},
        title: "Magnitude(volt)"},
        
    title: {
    text:"Unfiltered Signal",
    font: {
        size: 15
    }
    }
  };
// Define Second Layout
  var layout2 = {
    paper_bgcolor:"#efefef",
    plot_bgcolor:"#efefef",
    autosize: true,
    margin: {
      l: 40,
      r: 10,
      b: 30,
      t: 30,
      pad: 0
    },
    xaxis: {title: "Time(ms)",titlefont: { size:10, color: 'black'},
        tickfont: {
            size: 10,
            color: 'black'}},
    yaxis: {
        titlefont: { size:10, color: 'black'},
        title: "Magnitude(volt)"},
    title: {
    text:"Filtered Signal",
    font: {
        size: 15
    }
    }
  };
// Define config
let config = { 
    responsive: true, 
    };




// Get current mouse position
function mousemove(event){
    flag1=true;
    let x= event.offsetX;
    let y= event.offsetY;
    realtimeX.push(x);
    realtimeY.push(y);

    newArray=realtimeX; 
    drawfilter=filteredsignal;
    var get_signal= applyfilter({signal: realtimeX});
    get_signal.then(data => get_data(data));

}


// clear arrays
canvas.addEventListener("click", function(event){
    flag1= false;
    flag2= false;
    realtimeX=[];
    realtimeY=[];
    amplitude= [];
    filteredsignal=[];
})





// Read csv file
function read_csv(){
  flag1= false;
  flag2= true;
  var file= document.getElementById("csv").files[0]
  Papa.parse(file, {
      header : true,
      skipEmptyLines: true,
      complete : function(results, file) {  
          //console.log("Result", results.data)                   //console.log(results.data[0].time)
          for (i=0; i< results.data.length; i++){
              timearray.push(parseFloat(results.data[i].time));
              amplitude.push(parseFloat(results.data[i].amplitude));

          }
          console.log("Parsing Completed");
          //realtimeX= amplitude;
          // get filtered signal
          var get_signal= applyfilter({signal: amplitude});
          get_signal.then(data => get_data(data));

        }

        
  }); 
  newArray= amplitude.slice(0,19);
  drawfilter= filteredsignal.slice(0,19)
}





  // Plot signal
  Plotly.newPlot('chart1', [{
    y: newArray,
    mode: 'lines',
    line: {color: '#80CAF6'}
  }], layout, config);

  var cnt = 0;
  var interval = setInterval(function() {

          
    newArray.splice(0, 1)
    var data_update = {
      y: [newArray]
    };
    if (flag1==false && flag2==true){
                amplitude.splice(0,1);
                newArray= amplitude.slice(0,19);
        }

    Plotly.update('chart1', data_update)

    if(++cnt === 10000) clearInterval(interval);
  }, 1000); 

  


  // Plot filtered signal
  Plotly.newPlot('chart2', [{
    y: drawfilter,
    mode: 'lines',
    line: {color: '#80CAF6'}
  }], layout2, config);

  var cnt2 = 0;
  var interval2 = setInterval(function() {

    drawfilter.splice(0, 1)
    var data_update2 = {
        y: [drawfilter]
      };

    if (flag1==false && flag2==true){
        filteredsignal.splice(0,1);
        drawfilter= filteredsignal.slice(0,19);
      }

    Plotly.update('chart2', data_update2)
    if(++cnt2 === 10000) clearInterval(interval2);
  }, 1000); 


  



function get_data(data){
    filteredsignal= data
  }




















// // Plot generated signal
// var time = new Date();
// var data = [{
//   //x: [time],
//   y: [realtimeX],
//   mode: 'lines',
//   line: {color: '#80CAF6'}
// }];
// // Define Layout
// var layout = {
//     options: {
//         scales:{x: {type: 'realtime'} }
//     },
       
//     autosize: false,
//     width: 400,
//     height: 300,
//     xaxis: {title: "Time()",titlefont: { size:10, color: 'black'},
//         tickfont: {
//             size: 10,
//             color: 'black'}},
//     yaxis: {
//         //automargin: true,
//         titlefont: { size:10, color: 'black'},
//         title: "Magnitude(volt)"},
//     title: {
//     text:"Unfiltered Signal",
//     font: {
//         size: 15
//     }
//     }
//   };
// // Define config
//   let config = { 
//         responsive: true, 
//         };

// Plotly.newPlot('chart1', data,layout,config);
// var cnt = 0;
// var interval = setInterval(function() {
//   var update = {
//   y: [[realtimeX]]
//   }
