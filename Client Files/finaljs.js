var window;
var bungieCommon = "https://www.bungie.net";
var characterIDs;
var counter = 0;
function Initialize(value){
  window = value;
  var path = "/characterids";
  fetchRequest(path).then(function(result){
    characterIDs = result;
    //console.log(result);
    loadCharacter(characterIDs[counter]);
  });
};
function loadCharacter(value){
  counter += value;
  if(counter > characterIDs.length-1)
    counter = 0;
  if(counter < 0)
    counter = characterIDs.length-1;
  //console.log("counter: "+counter);
  //console.log("requesting character id: "+characterIDs[counter]);
  loadCharacterElement(characterIDs[counter]);
  loadCharacterContent(characterIDs[counter]);
}
async function loadCharacterElement(characterID){
  var path = "/character/"+characterID+"/general";
  await fetchRequest(path).then(function(result){
    //console.log(result);
    //console.log("setting up character element.");
    window.document.getElementById("emblem-back").src = bungieCommon+result.emblem.emblemExpanded.secondarySpecial;
    window.document.getElementById("emblem-icon").src = bungieCommon+result.emblem.emblemExpanded.secondaryOverlay;
    window.document.getElementById("character-class").innerHTML = "lvl "+result.level+" "+result.class.name;
    window.document.getElementById("character-light").innerHTML = result.light;
  });
}
function loadCharacterContent(characterID){
  var path = "/character/"+characterID+"/equipment";
  fetchRequest(path).then(function(result){
    //console.log("Equipment:");
    //console.log(result);
    for(i in result){
      var weaponType = result[i].bucketData.displayProperties.name;
      //console.log(weaponType);
      var element = window.document.getElementById(weaponType);
      //console.log(weaponType);
      while(element.firstChild){ element.removeChild(element.firstChild); }
      if(weaponType == "Subclass"){
        window.document.getElementById(weaponType).src = bungieCommon+result[i].hashData.displayProperties.icon;
      }
      else {
        var img = window.document.createElement("img");
        img.src = bungieCommon+result[i].hashData.displayProperties.icon;
        element.append(img);
      }
      //console.log("finished creation of element "+weaponType);
    }
  });
}

async function fetchRequest(path){
  var request = new Request(path, {
    method: "GET",
    headers: {"Content-Type":"application/json"},
  });
  let response = await fetch(request);
  if(response.status >=200 && response.status < 300)
  {return response.json();}
  else
  {return Promise.reject(new Error(response.statusText));}
};

function test(){
  var path = "/character/"+characterIDs[0]+"/inventory";
  fetchRequest(path).then(function(result){
    console.log(result);
  });
}
