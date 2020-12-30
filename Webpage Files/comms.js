var Window;
function loadInit(value){
  Window = value;
  console.log("logged");
}
function loadSubMenu(number){
  var parent = Window.document.getElementById("statistics");
  var children = parent.children;
  var childinQuestion = children[(number*2)-1];
  if(childinQuestion.style.display == "none")
    childinQuestion.style.display = "flex";
  else
    childinQuestion.style.display = "none";

}
