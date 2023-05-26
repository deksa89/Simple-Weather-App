const button = document.getElementById("button");
const input = document.getElementById("input");
const delCache = document.getElementById("del-cache");
const forecast3Days = document.getElementById("forecast-button");

const processChanges = debounce((e) => weatherApi(e)); // funkcija weatherApi prima agrument te mu ga moramo i dati

button.addEventListener("click", processChanges);
document.addEventListener("DOMContentLoaded", processChanges);
input.addEventListener("click", removeContent);

// funkcija za brisanje cache-a

delCache.addEventListener("click", ()=>{
  const cacheName = "DEKSINA-APP";
  const obrisi = caches.delete(cacheName)
  console.log("KEŠ JE OBRISAN")
})




// Debounce funkcija vraca rezultat s odgodom od 3 sekunde
function debounce(func, timeout = 1000) {
  let timer;
  return (...args) => {
    document.getElementById("content").innerHTML = "<p>Data is loading, please wait...</p>";
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

async function weatherApi(grad) {

    if ("serviceWorker" in navigator) {
      //provjeravamo da li browser podrzava service worker-e, ako da, u tom slucaju izvrsava kod
      navigator.serviceWorker.register("./sw.js") //ovo je asinkron task i vraca Promise
        //.then((reg) => console.log("service worker registered"))
    }

    // event.target vraca element koji je pokrenuo taj event npr. <button>Pretrazi</button>, 
    // value vraca njegovu vrijednost a previousElementSibling vraca od prethodnog elementa vrijednost
    // let grad = event.target.previousElementSibling.value; //vraca ime koje smo upisali u tražilicu i prosljeđuje u api

    grad = input.value ? input.value : "zagreb";

    
      let response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=bdbf7197ebc24abbb15104932220407&q=${grad}&aqi=yes&days=3`
      ).catch(uhvatiError);
      //console.log("API-response: ", response)

      
      let data = await response.json()
      //console.log(data); // ispisuje podatke o vremenu za trazeni grad

      
      if (data.error) {
          document.getElementById("content").innerHTML = `<p id="nodata">No data for the requested city</p>`;
      } 
      else {
          dayTime(data);

          let rezultat = `<p id="location">${data.location.name}, ${data.location.country}, ${data.location.localtime}</p><ul id="lista">`;
              rezultat += weatherConditions(data);
              rezultat += temperatura(data);
              rezultat += cloudCover(data);
              rezultat += uvZracenje(data);
          rezultat += "</ul>";
          document.getElementById("content").innerHTML = rezultat;
      }
  
    
  // hvata network error koji vrati Promise 
  function uhvatiError(){
    console.log("uhvacen error iz app.js-a")
    document.getElementById("content").innerHTML = `<p id="nointernet">No internet connection</p>`;
    
  }

  // u slucaju da nema interneta, u sw.js-u catch uhvati error i izvuce stare podatke iz cache-a ako ih ima
  // te posalje poruku app.js-u da u DOM doda novi <p> element s porukom "No internet connection"
  navigator.serviceWorker.addEventListener("message", (event) => {
    //console.log(event.data.msg, event.data.url);
    
    const newDiv = document.createElement("p");
    newDiv.innerText = `No internet connection`;
    document.getElementById("novo").innerHTML = newDiv.innerText;    
  });

  forecast3Days.addEventListener("click", ()=>{
    const noviDiv = document.createElement("div");
    noviDiv.className = "forecast"

    forecast = document.getElementById("forForecast");
    
    forecast.append(noviDiv)
    

    noviDiv.innerHTML += date1(data);
    noviDiv.innerHTML += date2(data);
    noviDiv.innerHTML += date3(data);

  })

}



// ------------------------------FUNKCIJE------------------------------------ //

// napisati kod za izbrisati prognozu 
function removeContent(el){
  if (el !== undefined){
    const firstNameInput = document.getElementById("input");
    firstNameInput.value = "";

    // klikom na input brise i novonastali element ".forecast"
    const forecastElem = document.querySelector(".forecast");
    if(forecastElem){
    forecastElem.remove();
    }
  }
}

function temperatura(element) {
  return `<li id="temp"><p id="temp-c">${element.current.temp_c} °C</p></li>`;
}

function cloudCover(element) {
  return `<li id="cloud">Cloud coverage: <p>${element.current.cloud}% </p></li>`;
}

function uvZracenje(element) {
  let zracenje = element.current.uv;

  if (zracenje >= 7) {
    return `<li id="uv-rad"><span id="uv-radiat">Dangerous level of UV.</span> The level of UV radiation is: <p>${element.current.uv}</p></li>`;
  } else {
    return `<li id="uv-rad">Level of UV radiation: <p>${element.current.uv}</p></li>`;
  }
}

function weatherConditions(element) {
  return `<li id="conditions">
            <p id="cond-txt">${element.current.condition.text}</p>
            <img id="cond-img" src="${element.current.condition.icon}">
          </li>`;
}

let addClassName;
function dayTime (element) {
    let datumVrijeme = element.location.localtime;
    let vrijeme = datumVrijeme.substr(10,)

    if (parseInt(vrijeme) > 6 && parseInt(vrijeme) < 20) {
      return (
        addClassName = document.getElementById("body-bg"),
        addClassName.setAttribute("class", "day"),
        document.getElementById("body-bg").style.backgroundImage ="url('imgs/th-sun.jpg')");
    }
    else{
      return (
        	addClassName = document.getElementById("body-bg"),
          addClassName.setAttribute("class", "night"),
        	document.getElementById("body-bg").style.backgroundImage = "url('imgs/nighta.jpg')");
    }
}


// ------------------------------ FUNKCIJE ZA PROGNOZU------------------------------------ //
function date1(element){
  let prognoza = element.forecast.forecastday;
  
  let progDan1 = ``
for (const item of Object.entries(prognoza)) {
  if(item[0] == "0"){

    progDan1 += `<div id="date1">
        <p>${item[1].date}</p>
        <p>${item[1].day.maxtemp_c}</p>
        <p>${item[1].day.condition.text}</p>
        <img src="${item[1].day.condition.icon}">
      </div>`;
  }
}
  return progDan1;
}


function date2(element) {
  let prognoza = element.forecast.forecastday;

  let progDan2 = ``;
  for (const item of Object.entries(prognoza)) {
    if (item[0] == "1") {

      progDan2 += `<div id="date2">
        <p>${item[1].date}</p>
        <p>${item[1].day.maxtemp_c}</p>
        <p>${item[1].day.condition.text}</p>
        <img src="${item[1].day.condition.icon}">
      </div>`;
    }
  }
  return progDan2;
}


function date3(element) {
  let prognoza = element.forecast.forecastday;

  let progDan3 = ``;
  for (const item of Object.entries(prognoza)) {
    if (item[0] == "2") {

      progDan3 += `<div id="date3">
        <p>${item[1].date}</p>
        <p>${item[1].day.maxtemp_c}</p>
        <p>${item[1].day.condition.text}</p>
        <img src="${item[1].day.condition.icon}">
      </div>`;
    }
  }
  return progDan3;
}

