// global variables
let ww;
let wh;
let ballBasic;
let ballSelected;
let orbitLong;
let orbitShort;
let orbits = [];
let orbitAngleUnit = 15;
let gainDefault = 2;
let fileURLs = [];
let progress = 0;

let keywordsJSON = {
  Creativity: ["Creativity.mp3", "Art.mp3", "Design.mp3"],
  Music: ["Music.mp3", "Jazz.mp3", "Samm_Henshaw.mp3", "Yoasobi.mp3"],
  Tom_And_Jerry: ["Tom_And_Jerry.mp3", "Mickey_Mouse.mp3", "Spongebob.mp3"],
  Manchester_United: [
    "Manchester_United.mp3",
    "Futsal.mp3",
    "Gabriel_Jesus.mp3",
  ],
  Pulp_Fiction: ["Pulp_Fiction.mp3", "Brad_Pitt.mp3", "Spiderman.mp3"],
  Overwatch: ["Overwatch.mp3", "FIFA.mp3"],
  Wanderlust: ["Wanderlust.mp3", "Stockholm.mp3", "Tokyo.mp3"],
};
let keywordAudioBuffers = {
  Creativity: [],
  Music: [],
  Tom_And_Jerry: [],
  Manchester_United: [],
  Pulp_Fiction: [],
  Overwatch: [],
  Wanderlust: [],
};
let descriptions = {
  Creativity:
    "Creativity;\nArt;\nDesign;\n\nJongik tries to infuse creativity into every moment, whether through design, art, or a simple daily joke.",
  Music:
    "Music;\nJazz;\nSamm_Henshaw;\nYoasobi;\n\nJongik finds comfort in music, having spent over 15 years performing his own melodies.",
  Tom_And_Jerry:
    "Tom and Jerry;\nMickey Mouse;\nSpongeBob;\n\nJongik enjoys watching classic animations to get unique inspirations from their timeless imagination.",
  Manchester_United:
    "Manchester United;\nFutsal;\nGabriel Jesus;\n\nJongik is a huge fan of football, and has passionately supported Manchester United for over a decade.",
  Pulp_Fiction:
    "Pulp Fiction;\nBard Pitt;\nSpiderman 3;\n\nJongik is captivated by films that challenge his paradigm and leave a lasting impression.",
  Overwatch:
    "Overwatch;\nFIFA;\n\nJongik immerses himself into online games in his free time.",
  Wanderlust:
    "Wanderlust;\nStockholm;\nTokyo;\n\nJongik has a restless spirit for travel and has experienced life in both Stockholm and Tokyo.",
};
// audio variables
let audioContext;
const audioPath =
  "https://raw.githubusercontent.com/JongikJeon/mindful-echoes/main/audio/";

// loading audio files
async function enter() {
  document.querySelector(".hover").style.display = "none";
  document.querySelector(".headphones").style.display = "none";
  document.querySelector(".loading-entering").style.display = "flex";
  document.querySelector(".loading-bar").style.display = "flex";

  audioContext = new AudioContext();
  audioContext.resume();

  for (let kw in keywordsJSON) {
    for (let w of keywordsJSON[kw]) fileURLs.push(audioPath + kw + "/" + w);
  }

  try {
    const audioBuffers = await Promise.all(fileURLs.map(decodeAudio));
  } catch (error) {
    console.error("Promise.all Function Error!!! " + error);
  }

  if (progress == 21) {
    document.querySelector(".loading").style.opacity = "0";
    document.querySelector(".content").style.opacity = "1";
    setTimeout(() => {
      document.querySelector(".loading").style.display = "none";
    }, 2000);
    audioContext.resume();
  }

  //draw orbits
  for (let i = -3; i <= 3; i++) {
    //for (let i = -3; i <= -3; i++) {
    orbits.push(
      new Orbit(
        orbitAngleUnit * i,
        keywordsJSON[Object.keys(keywordsJSON)[i + 3]],
        keywordAudioBuffers[Object.keys(keywordAudioBuffers)[i + 3]],
        descriptions[Object.keys(descriptions)[i + 3]]
      )
    );
  }
  const h3Elements = document.querySelectorAll("h3");
  const pElement = document.querySelector("#description");

  h3Elements.forEach((h3) => {
    h3.addEventListener("mouseover", (event) => {
      h3.style.color = color(255, 77, 77);
      for (let of of orbits) {
        if (of.getKeyword()[0].slice(0, -4) != h3.id) {
          of.invisible();
          of.setGainer(0);
        } else {
          pElement.textContent = of.getDescription();
          of.setSelected(true);
          of.playSoundSelected(0);
          of.setGainer(0);
        }
      }
    });
  });

  h3Elements.forEach((h3) => {
    h3.addEventListener("mouseout", (event) => {
      h3.style.color = color(255, 255, 255, 100);
      for (let of of orbits) {
        of.visible();
        of.setGainer(gainDefault);
        of.setSelected(false);
      }
      pElement.textContent = "";
    });
  });
}

async function decodeAudio(url) {
  try {
    let response = await fetch(url);
    let arrayBuffer = await response.arrayBuffer();
    let keyword = await audioContext.decodeAudioData(arrayBuffer);
    for (let kw in keywordsJSON) {
      for (let k of keywordsJSON[kw]) {
        if (k == url.split("/").pop()) {
          keywordAudioBuffers[kw].push(keyword);
        }
      }
    }
    progress++;
    let progress100 = (progress / 21) * 100;
    let progressBar = document.querySelector(".loading-bar-progress");
    progressBar.style.width = progress100 + "%";
  } catch (error) {
    console.error("Decoding Error!!! " + error);
  }
}

function setup() {
  ww = windowWidth / 2;
  wh = windowHeight;
  orbitLong = ww / 1.1;
  orbitShort = ww / 5;
  ballBasic = color(217, 217, 217);
  ballSelected = color(255, 77, 77);

  let canvas = createCanvas(ww, wh);
  canvas.parent("area2");
  background(12);
  angleMode(DEGREES);
}

function draw() {
  background(12);
  if (audioContext) {
    for (let ob of orbits) {
      ob.showOrbit();
      ob.moveBall();
    }

    // keep audioContext open
    if (audioContext.state !== "running") {
      audioContext.resume();
      console.log("AudioContext resumed!!!");
    }
  }
}

class Orbit {
  constructor(orbitAngle, keyword, keywordAudioBuffer, description) {
    this.orbitAngle = orbitAngle;
    this.keyword = keyword;
    this.keywordAudioBuffer = keywordAudioBuffer;
    this.ballAngle = random(0, 360);
    this.ballColor = ballBasic;
    this.speed = random(0.5, 1.5);
    this.radiusMin = ww / 150;
    this.radiusMax = ww / 60;
    this.isVisible = true;
    this.description = description;
    this.isSelected = false;

    this.gainer = audioContext.createGain();
    this.gainer.gain.value = gainDefault;
    this.gainerS = audioContext.createGain();
    this.gainerS.gain.value = gainDefault + 0.5;
    this.setPanner();

    setTimeout(
      () => {
        this.playSound();
        document.querySelector(".area3-text").style.pointerEvents = "auto";
      },
      random(3000, 6000)
    );
  }

  setPanner() {
    this.panner = audioContext.createPanner();
    this.panner.panningModel = "HRTF";
    this.panner.distanceModel = "inverse";
    this.panner.orientationX.value = 1;
    this.panner.orientationY.value = 0;
    this.panner.orientationZ.value = 0;

    this.panner.rolloffFactor = 1.5;
    //this.panner.coneInnerAngle = 40;
    //this.panner.coneOuterAngle = 50;
    //this.panner.coneOuterGain = 0.4;
  }

  showOrbit() {
    push();
    noFill();
    stroke(255, 255, 255, 100);
    strokeWeight(0.5);
    translate(ww / 2, wh / 2);
    rotate(this.orbitAngle);

    if (!this.isVisible) {
      stroke(255, 255, 255, 30);
    }
    ellipse(0, 0, orbitLong, orbitShort);
    pop();
  }

  moveBall() {
    fill(this.ballColor);
    push();
    translate(ww / 2, wh / 2);
    noStroke();
    rotate(this.orbitAngle);
    let ballX = 0.5 * orbitLong * cos(this.ballAngle);
    let ballY = 0.5 * orbitShort * sin(this.ballAngle);
    if (this.isVisible) {
      circle(
        ballX,
        ballY,
        (this.radiusMax - this.radiusMin) * (0.5 * sin(this.ballAngle) + 1) +
          this.radiusMin
      );
    }
    pop();

    this.panner.positionX.value = (cos(this.ballAngle) * orbitLong) / 200;
    this.panner.positionY.value =
      (-1 * cos(this.ballAngle) * sin(this.orbitAngle) * orbitLong) / 200;
    this.panner.positionZ.value =
      (-1 * (sin(this.ballAngle) * orbitShort)) / 200;

    this.ballAngle = (this.ballAngle + this.speed) % 360;
  }

  playSound() {
    let currIndex = random(this.keywordAudioBuffer.length);
    let currSound = this.keywordAudioBuffer[Math.floor(currIndex)];
    let currLength = (currSound.length / currSound.sampleRate) * 1000;
    this.source = audioContext.createBufferSource();
    this.source.buffer = currSound;
    this.source
      .connect(this.gainer)
      .connect(this.panner)
      .connect(audioContext.destination);
    if (this.isVisible && this.gainer.gain.value != 0) {
      this.source.start();
      this.ballColor = ballSelected;
      setTimeout(() => {
        this.ballColor = ballBasic;
      }, currLength);
    }
    setTimeout(
      () => {
        this.playSound();
      },
      random(currLength + 1000, 3000)
    );
  }

  playSoundSelected(c) {
    if (this.isSelected) {
      let currSound = this.keywordAudioBuffer[c];
      let currLength = (currSound.length / currSound.sampleRate) * 1000;
      this.source = audioContext.createBufferSource();
      this.source.buffer = currSound;
      this.source
        .connect(this.gainerS)
        .connect(this.panner)
        .connect(audioContext.destination);
      this.source.start();
      setTimeout(() => {
        this.playSoundSelected((c + 1) % this.keywordAudioBuffer.length);
      }, currLength + 800);
      this.ballColor = ballSelected;
      setTimeout(() => {
        this.ballColor = ballBasic;
      }, currLength);
    }
  }

  visible() {
    this.isVisible = true;
  }

  invisible() {
    this.isVisible = false;
  }

  getIsVisible() {
    return this.isVisible;
  }

  setGainer(gain) {
    this.gainer.gain.value = gain;
  }

  setSelected(bool) {
    this.isSelected = bool;
  }

  getPanner() {
    return [
      this.panner.positionX.value,
      this.panner.positionY.value,
      this.panner.positionZ.value,
    ];
  }

  getDescription() {
    return this.description;
  }

  getBallAngle() {
    return this.ballAngle;
  }

  getOrbitAngle() {
    return this.orbitAngle;
  }

  getKeyword() {
    return this.keyword;
  }

  getKeywordAudioBuffer() {
    return this.keywordAudioBuffer;
  }
}
