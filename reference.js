// ml5.js: Pose Classification
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/Courses/ml5-beginners-guide/7.2-pose-classification.html
// https://youtu.be/FYgYyq-xqAw

// All code: https://editor.p5js.org/codingtrain/sketches/JoZl-QRPK

// Separated into three sketches
// 1: Data Collection: https://editor.p5js.org/codingtrain/sketches/kTM0Gm-1q
// 2: Model Training: https://editor.p5js.org/codingtrain/sketches/-Ywq20rM9
// 3: Model Deployment: https://editor.p5js.org/codingtrain/sketches/c5sDNr8eM

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "Loading";
let time = 0;

function setup() {
  Notification.requestPermission();

  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "models/model2/model.json",
    metadata: "models/model2/model_meta.json",
    weights: "models/model2/model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log("pose classification ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    switch (results[0].label.toUpperCase()) {
      case "G":
        poseLabel = "Good Posture";
        time = 0;
        break;
      case "L":
        poseLabel = "Left Slouch";
        time++;

        break;
      case "R":
        poseLabel = "Right Slouch";
        time++;

        break;
      case "D":
        poseLabel = "Double Slouch";
        time++;

        break;
    }
  }

  console.log("SluchAI Unit Timer -> ", time);
  // 1 second === 10 time
  if (time === 50) {
    notify(poseLabel);
    time = 0;
  }
  //console.log(results[0].confidence);
  classifyPose();
}

// send notification
const notify = async () => {
  if (Notification.permission === "granted") {
    const notification = new Notification("SlüchAI", {
      body: `You have been in ${poseLabel} for ${time / 10} seconds`,
    });
  }
};

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(3);
      stroke(0, 255, 0); // skeleton line color

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0, 255, 0); // points
      stroke(255);
      ellipse(x, y, 10, 10); // dot radius
    }
  }
  pop();

  fill(255, 0, 0);
  stroke(0, 0, 0); // border
  textSize(50);
  textAlign(0, 0);
  text(poseLabel, 10, 450);
}
