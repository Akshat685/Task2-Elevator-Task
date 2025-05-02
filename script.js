const buttons = document.querySelectorAll(".btn");
const elevators = document.querySelectorAll(".imgWrapper");

let queueFloors = [];

let allLiftStatus = [
  { liftIndex: 0, moving: false, floor: 0 },
  { liftIndex: 1, moving: false, floor: 0 },
  { liftIndex: 2, moving: false, floor: 0 },
  { liftIndex: 3, moving: false, floor: 0 },
  { liftIndex: 4, moving: false, floor: 0 },
];

function findMinDistance(currentFloor, allLiftStatus) {
  let minDistance = Infinity;
  let minDistanceIndex = Infinity;

  for (let i = 0; i < allLiftStatus.length; i++) {
    let diff = Math.abs(currentFloor - allLiftStatus[i].floor);
    if (diff < minDistance && !allLiftStatus[i].moving) {
      minDistance = diff;
      minDistanceIndex = i;
    }
  }
  return [minDistance, minDistanceIndex];
}

function isLiftAlreayThere(allLiftStatus, calledFloor) {
  return allLiftStatus.some((lift) => lift.floor === calledFloor);
}

function allLiftsMoving(allLiftStatus) {
  return allLiftStatus.every((lift) => lift.moving === true);
}

const playSound = () => {
  const audio = new Audio("https://elevator-exercise.vercel.app/lift-sound.mp3");
  audio.play();
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const clickedFloor = parseInt(button.id.split("-")[1]);

    if (allLiftsMoving(allLiftStatus)) {
      queueFloors.push(clickedFloor);
    }

    if (!isLiftAlreayThere(allLiftStatus, clickedFloor)) {
      button.style.backgroundColor = "red";
      button.textContent = "Waiting";
      button.disabled = true;

      LiftStatus(clickedFloor, button);
    }
  });
});

function LiftStatus(clickedFloor, button) {
  const [nearestLiftDistance, nearestLiftIndex] = findMinDistance(
    clickedFloor,
    allLiftStatus
  );

  // Display estimated time of arrival
  if (clickedFloor !== 0) {
    const rowElement = document.getElementById(`row-${clickedFloor}`);
    const destinationBox = rowElement.querySelector(
      `.box:nth-child(${nearestLiftIndex + 2})`
    );
    if (destinationBox) {
      destinationBox.textContent = `${nearestLiftDistance * 0.5} Sec`;
    }
  }

  MoveLift(clickedFloor, nearestLiftIndex, button);
}

function MoveLift(clickedFloor, pos, button) {
  const elevator = elevators[pos];
  const currentFloor = allLiftStatus[pos].floor;

  // Update lift status
  allLiftStatus[pos].floor = clickedFloor;
  allLiftStatus[pos].moving = true;

  // Change lift color to red (moving)
  elevator.style.filter = "invert(17%) sepia(92%) saturate(6556%) hue-rotate(1deg) brightness(97%) contrast(126%)";

  let duration = Math.abs(clickedFloor - currentFloor) * 0.5;

  elevator.style.transition = `transform ${duration}s linear`;
  elevator.style.transform = `translateY(-${clickedFloor * 130}%)`;

  setTimeout(() => {
    // Remove estimated time of arrival
    if (clickedFloor !== 0) {
      const rowElement = document.getElementById(`row-${clickedFloor}`);
      const destinationBox = rowElement.querySelector(
        `.box:nth-child(${pos + 2})`
      );
      if (destinationBox) {
        destinationBox.textContent = ``;
      }
    }

    // Play lift sound
    playSound();

    // Change Elevator Color to green (arrived)
    elevator.style.filter = "invert(50%) sepia(79%) saturate(358%) hue-rotate(76deg) brightness(98%) contrast(86%)";

    // Change Button text and color
    button.style.backgroundColor = "white";
    button.textContent = "Arrived";
    button.style.border = "1px solid green";
  }, duration * 1000);

  setTimeout(() => {
    // Change lift state back to idle
    allLiftStatus[pos].moving = false;

    // Reset Button
    button.style.backgroundColor = "rgb(101, 237, 101)";
    button.textContent = "Call";
    button.style.border = "none";
    button.disabled = false;

    // Reset lift color to black (idle)
    elevator.style.filter = "invert(0)";

    // Process next floor in queue
    if (queueFloors.length) {
      const nextFloor = queueFloors.shift();
      const nextButton = document.getElementById(`btn-${nextFloor}`);
      LiftStatus(nextFloor, nextButton);
    }
  }, duration * 1000 + 2000);
}
