function toggleas(a){
  a.children[0].click();
  if (a.classList.contains("dark-button")){
    a.classList.toggle("dark-button");
    var childs = a.parentElement.children;
    for(var i =0; i<childs.length; i++){
      if(childs[i] != a){
        childs[i].classList.toggle("dark-button");
      }
    }
  }
  else{

  }
  }

function remove(a){
    a.children[0].click();
    
}






                               /* Correct Phase */


function myFunction() {
document.getElementById('Allpass').style.display = 'grid';
document.getElementById('filter').style.display = 'none';
}


function GoBack(){
  document.getElementById('Allpass').style.display = 'none';
document.getElementById('filter').style.display = 'grid';
}



// $(document).ready(function() {

// 	var next = $("#next")
// 	var previous =$("#previous")

// 	$(document).ready(function() {
	
// 		$(next).click(function () {
// 			$("ul").css({
// 				'margin-top' : '-303px' , 
// 				'transition' : 'all 1.5s ease-in-out'
// 			});

// 		});		
		
// 		$(previous).click(function () {
// 			$("ul").css("margin-top", "0");

// 		});

// 	});
// });

