var window = "";
var d2ID = "";
var characterEquipment = [];
var bungieCommon = "https://www.bungie.net";
function Initialize(passed){
  window = passed;
  var id = window.location.pathname.split("/");
  d2ID = id[1];
  var pData = getProfileData();
  getCharacterData().then(function(result){
    console.log("Data retrieved");
    loadCharacterList(result);
  });
}
async function getProfileData(){
  var path = "/"+d2ID+"/data";
    await fetchRequest(path).then(function(result){
      return result;
    });
}
async function getCharacterData(){
  var path = "/"+d2ID+"/character/data";
  var characterData = {};
  await fetchRequest(path).then(function(result){
    console.log("Done");
    var characterIDs = Object.keys(result.characters.data);

    characterIDs.forEach(function(item,index){
      characterData[item] = {};
      characterData[item].character = result.characters.data[item];
      characterData[item].characterProgressions = result.characterProgressions.data[item];
      characterData[item].characterEquipment = result.characterEquipment.data[item];
    });
  });
  return characterData;
}
function loadCharacterList(characters){
  console.log(characters);
  var count = 1;
  for(i in characters){
    console.log(i);
    var characterElement = window.document.getElementById("character"+count);
    console.log(characterElement);
    var background = window.document.createElement("img");
    background.src = bungieCommon+characters[i].character.emblemBackgroundPath;
    characterElement.append(background);
    text = window.document.createElement("h1");
    text.innerHTML = characters[i].character.classType;
    text.classList.add("image-overlay-BL");
    characterElement.append(text);
    text = window.document.createElement("h1");
    text.innerHTML = characters[i].character.light;
    text.classList.add("image-overlay-TR");
    characterElement.append(text);
    characterElement.id = i;
    count += 1;
  }
}
function loadCharacterPage(){

}
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
