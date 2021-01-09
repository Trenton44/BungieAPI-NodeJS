var bungieCommon = "https://www.bungie.net";
var D2classTypes = ["Titan","Hunter","Warlock","Unknown"];



function loadInit(value){
  Window = value;
  console.log("logged");
}
/*function buildCharacters(chars){
  for(i in chars.data){
    console.log("building character "+i);
    console.log();
    Window.document.getElementById("characters").appendChild(buildCharacterHTML(chars.data[i]));
    var url = bungieCommon+chars.data[i].emblemBackgroundPath;
    Window.document.getElementById(i).style.backgroundImage = "url("+url+")" ;
  }
}*/

//The General fetch request.
async function fetchRequest(path){
  var request = new Request(path,{
    method: "GET",
    headers: {"Content-Type":"application/json"},
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response.json();}
  else
  {return Promise.reject(new Error(response.statusText));}
};

//Functions that take the data and use to actual construct or alter the webpage.
function buildCharacterHTML(character){
  console.log(character);
  var container = Window.document.createElement("header");
  var classType = Window.document.createElement("h1");
  var lightLevel = Window.document.createElement("h1");
  container.id = character.characterId;
  classType.innerHTML = D2classTypes[character.classType];
  lightLevel.innerHTML = character.light;
  container.appendChild(classType);
  container.appendChild(lightLevel);
  return container;
}
