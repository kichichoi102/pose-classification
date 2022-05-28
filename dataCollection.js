let video;
let poseNet;
let pose;
let skeleton;

let brain;

let state = 'waiting';
let targetLabel;

// Poses: good posture, slouching left, slouching right, slouching down, camera off
/*
Good: g
Slouching Left: l
Slouching Right: r
Slouching down: d
*/

function keyPressed() {
    if (key == 's') {
        brain.saveData()
    } else {
        targetLabel = key;
        console.log(targetLabel)
        setTimeout(function() {
            console.log('collecting')
            state = 'collecting'
            setTimeout(function() {
                console.log('not collecting')
                state = 'waiting'
            }, 10000)
        }, 2000
        )
    }
}

function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide()
    poseNet = ml5.poseNet(video, modelLoaded);
    poseNet.on('pose', gotPoses);

    // configure and instantiate neural network object
    let options = {
        inputs: 34, // 17 x,y coordinates = 34 points
        outputs: 4, // 5 output/poses
        tasks: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options);
}

function gotPoses(poses) {
    // console.log(poses);
    if (poses.length > 0) {
        pose = poses[0].pose;
    }

    if (state == 'collecting') {
        let inputs = [];
        for (let i=0; i < pose.keypoints.length; i++) {
            if (pose.keypoints[i]) {
                // console.log(pose.keypoints[i].position)
                let x = pose.keypoints[i].position.x
                let y = pose.keypoints[i].position.y
                inputs.push(x)
                inputs.push(y)
            }
            let target = [targetLabel];
            brain.addData(inputs, target)
        }
    }
}

function modelLoaded() {
    console.log('poseNet Ready')
}

function draw() {
    translate(video.width, 0, 0, video.width, video.height);
    scale(-1, 1)
    image(video, 0, 0)
    if (pose) {
        fill(255,0,0)
        ellipse(pose.nose.x, pose.nose.y, 25)
        
        for (let i=0; i < pose.keypoints.length; i++) {
            if (pose.keypoints[i]) {
                // console.log(pose.keypoints[i].position)
                let x = pose.keypoints[i].position.x
                let y = pose.keypoints[i].position.y
                ellipse(x, y, 10)
            }
            
        }
    }
}