importScripts('./lodash.min.js');

const createField = (width, height) => {
  const newField = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => '**')
  );
  return newField;
};

// Function to convert a string to a color
const stringToColor = async (string) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(string));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // Generate warm colors by focusing on the warm spectrum
  const r = parseInt(hashHex.substring(0, 6), 16) % 256; // Red component
  const g = parseInt(hashHex.substring(6, 12), 16) % 200; // Green component
  const b = parseInt(hashHex.substring(12, 18), 16) % 100; // Blue component

  return `rgb(${r}, ${g}, ${b})`;
};

const handleWidthChange = (e) => {
  setWidth(parseInt(e.target.value));
};

const handleHeightChange = (e) => {
  setHeight(parseInt(e.target.value));
};

const handleNumBoxesChange = (e) => {
  setNumBoxes(parseInt(e.target.value));
};

const handleMinSizeChange = (e) => {
  setMinSize(parseInt(e.target.value));
};

const handleMaxSizeChange = (e) => {
  setMaxSize(parseInt(e.target.value));
};

function getBoxOptions(minSize, maxSize, width, height) {
  const options = new Set();
  for (let i = minSize; i <= maxSize; i++) {
    for (let j = minSize; j <= maxSize; j++) {
      if (j <= height && i <= width) {
        options.add([i, j, i * j].toString());
        options.add([j, i, i * j].toString());
      }
    }
  }

  return Array.from(options).sort((a, b) => b[2] - a[2]);
}

function findSequenceOfLength(number, numbers, length, boxOptions) {
  /*const nums = [];

  for (let i = 0; i < boxOptions.length; i++) {
    const size = boxOptions[i].split(",")[2];

    if (numbers.includes(size)) {
      nums.push(size);
    }
  }*/

  const nums = numbers;

  shuffle(nums);

  let foundSequence = [];

  function dfs(target, path) {
    if (target === 0 && path.length === length) {
      foundSequence = [...path];
      return;
    }

    for (const num of nums) {
      if (num <= target) {
        path.push(num);
        dfs(target - num, path);
        path.pop();
      }
    }
  }

  dfs(number, []);

  return foundSequence;
}

function findSequenceOfLengthBest(number, numbers, length, boxOptions) {
  const nums = [];

  for (let i = 0; i < boxOptions.length; i++) {
    const size = boxOptions[i].split(",")[2];

    if (numbers.includes(size)) {
      nums.push(size);
    }
  }

  shuffle(nums);

  //console.log("sum: ",number)
  //console.log("Nums: ",nums)
  //console.log("seq demanded length: ",length)

  const dp = Array.from({ length: length + 1 }, () => Array(number + 1).fill(null));

  try {
    dp[0][0] = [];
  } catch (e) {
    return [];
  }

  for (let i = 1; i <= length; i++) {
    for (let j = 0; j <= number; j++) {
      for (const num of nums) {
        if (j - num >= 0 && dp[i - 1][j - num] !== null) {
          if (dp[i][j] === null || dp[i][j].length < i) {
            const nextSequence = dp[i - 1][j - num].concat([num]);
            if (!hasRepetition(nextSequence) || i >= length * 0.8) {
              dp[i][j] = nextSequence;
            }
          }
        }
      }
    }
  }

  return dp[length][number] !== null ? dp[length][number] : [];
}

function findSequenceOfLengthSecondBest(number, numbers, length, boxOptions) {
  const nums = numbers
  shuffle(nums);

  const dp = Array.from({ length: length + 1 }, () => Array(number + 1).fill(null));

  try {
    dp[0][0] = [];
  } catch (e) {
    return [];
  }

  for (let i = 1; i <= length; i++) {
    for (let j = 0; j <= number; j++) {
      for (const num of nums) {
        if (j - num >= 0 && dp[i - 1][j - num] !== null) {
          if (dp[i][j] === null || dp[i][j].length < i) {
            const nextSequence = dp[i - 1][j - num].concat([num]);
            dp[i][j] = nextSequence;
          }
        }
      }
    }
  }

  return dp[length][number] !== null ? dp[length][number] : [];
}

function generateSequence(targetSum, arr, length) {
  const result = [];

  function dfs(currentSum, path) {
    if (currentSum === targetSum && path.length === length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      if (currentSum + arr[i] <= targetSum) {
        path.push(arr[i]);
        dfs(currentSum + arr[i], path);
        path.pop();
      }
    }
  }

  dfs(0, []);

  return result;
}

// Check if there are repetitions in the sequence
function hasRepetition(sequence) {
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) {
      return true;
    }
  }
  return false;
}

// Helper function to shuffle an array
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
}

function bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes) {
  for (let row of field) {
      for (let element of row) {
          if (element === "**") {
              return false;
          }
      }
  }

  //console.log("Bento filled? ",numBoxesSoFar === numBoxes,numBoxesSoFar,numBoxes);

  return numBoxesSoFar === numBoxes;
}

function storeForbiddenPath(forbiddenPathsDict, path, position, boxOption) {
  if (forbiddenPathsDict[path]) {
      if (!forbiddenPathsDict[path].includes(`${boxOption},${position}`)) {
          forbiddenPathsDict[path].push(`${boxOption},${position}`);
      }
  } else {
      forbiddenPathsDict[path] = [`${boxOption},${position}`];
  }
}

function retrieveForbiddenPaths(forbiddenPathsDict, basePath) {
    return forbiddenPathsDict[basePath] || [];
}

function getBoxOptionsFromSize(minSize, maxSize, size, width, height) {
  const boxOptions = getBoxOptions(minSize, maxSize, width, height);
  //console.log("Box ops: ",boxOptions, " size: ",size)
  return boxOptions.filter(x => x.split(",")[2] === size);
}

function findCandidateIndices(field, boxOptionString) {
  const boxOption = boxOptionString.split(",");
  const boxWidth = parseInt(boxOption[0]);
  const boxHeight = parseInt(boxOption[1]);

  const indices = [];

  const rows = field.length;
  const cols = rows > 0 ? field[0].length : 0;

  for (let i = 0; i < rows - boxHeight + 1; i++) {
      for (let j = 0; j < cols - boxWidth + 1; j++) {
          const subArr = field.slice(i, i + boxHeight).map(row => row.slice(j, j + boxWidth));
          const isAllEmpty = subArr.every(row => row.every(elem => elem === "**"));
          if (isAllEmpty) {
              indices.push([i, j]);
          }
      }
  }

  return indices;
}

function augmentWithBox(field, index, boxOptionString, newChar) {
  //console.log("Augmentation time!!! ", index)
  const fieldCopy = field.map(row => [...row]); // Deep copy of the field

  const boxOption = boxOptionString.split(",")
  const boxWidth = parseInt(boxOption[0]);
  const boxHeight = parseInt(boxOption[1]);

  const [x, y] = index;
  for (let i = x; i < x + boxHeight; i++) {
      for (let j = y; j < y + boxWidth; j++) {
          //console.log("Augmentation time!!!XXX")
          fieldCopy[i][j] = `*${newChar}`;
      }
  }

  return fieldCopy;
}

onmessage = function (e) {
  // Receive the data sent from the main thread
  const { width, height, numBoxes, minSize, maxSize } = e.data;

  let field = createField(width, height);

  const boxOptions = getBoxOptions(minSize, maxSize, width, height);

  const boxSizes = boxOptions.map((x) => x.split(",")[2]);

  //console.log("Box options: ",boxOptions);
  //console.log("Box sizes: ",boxSizes);

  let theSequence = findSequenceOfLengthBest(width * height, boxSizes, numBoxes, boxOptions);
  //let theSequence = generateSequence(width * height, boxSizes, numBoxes);
  //shuffle(theSequence);
  theSequence.sort((a, b) => b - a);

  //console.log("Sequence: ",theSequence)

  if(theSequence.length == 0){
    //console.log("Non seq")
    theSequence = findSequenceOfLengthSecondBest(width * height, boxSizes, numBoxes, boxOptions);

    if(theSequence.length == 0){
      postMessage(null)
    }
  }

  //setSequence(theSequence.toString());

  let prevPrevState = _.cloneDeep(field);
  let prevState = _.cloneDeep(field);

  let prevPrevNumBoxes = 0;
  let prevNumBoxes = 0;
  const forbiddenPathsDict = {};
  let runNumber = 0;

  let numBoxesSoFar = 0
  let currentPath = []

  if(theSequence.length > 0){
    while (!bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)) {
      const relevantBoxSize = theSequence[numBoxesSoFar];
      const relevantBoxOptions = getBoxOptionsFromSize(minSize, maxSize, relevantBoxSize, width, height);

      let newBoxCanBeAdded = false;
      let newBoxOption = null;
      let newBoxIndex = null;

      //console.log("relevantBoxSize: ",relevantBoxSize);
      //console.log("relevantBoxOptions: ",relevantBoxOptions);

      for (const boxOption of relevantBoxOptions) {
          const candidateIndices = findCandidateIndices(field, boxOption);
          ////console.log("candidateIndices: ",candidateIndices);
          const validCandidateIndices = [];

          for (const candidateIndex of candidateIndices) {
              const pathStr = `${candidateIndex},${boxOption}`;
              if (!retrieveForbiddenPaths(forbiddenPathsDict, String(currentPath)).includes(pathStr)) {
                  ////console.log("ValidCandidate: ",candidateIndex,boxOption)
                  validCandidateIndices.push(candidateIndex);
              }
          }

          if (validCandidateIndices.length > 0) {
              newBoxCanBeAdded = true;
              newBoxOption = boxOption;
              const randomIndex = Math.floor(Math.random() * validCandidateIndices.length)
              //console.log("vc length: ",validCandidateIndices.length)
              //console.log("randomIndex: ",randomIndex)
              newBoxIndex = validCandidateIndices[randomIndex];
              /*
              if (validCandidateIndices.some(index => index[0] === 0 && index[1] === 0)) {
                newBoxIndex = [0, 0];
              } else {
                newBoxIndex = validCandidateIndices[Math.floor(Math.random() * validCandidateIndices.length)];
              }*/
              break;
          }
      }

      if (newBoxCanBeAdded) {
          prevPrevNumBoxes = prevNumBoxes;
          prevPrevState = _.cloneDeep(prevState);
          prevNumBoxes = numBoxesSoFar;
          prevState = _.cloneDeep(field);
          const augmentedField = augmentWithBox(field, newBoxIndex, newBoxOption, numBoxesSoFar);
          field = _.cloneDeep(augmentedField);
          numBoxesSoFar++;

          currentPath.push([newBoxOption, newBoxIndex]);
      } else {
          if (currentPath.length === 0) {
              field = createField(width, height);

              prevPrevNumBoxes = 0;
              prevPrevState = _.cloneDeep(field);

              prevNumBoxes = 0;
              prevState = _.cloneDeep(field);

              numBoxesSoFar = 0;
          } else {
              const [lastBoxPosition, lastBoxOption] = currentPath.pop();

              storeForbiddenPath(forbiddenPathsDict, String(currentPath), lastBoxPosition, lastBoxOption);

              if (currentPath.length === 0) {
                  field = createField(width, height);

                  prevPrevNumBoxes = 0;
                  prevPrevState = _.cloneDeep(field);

                  prevNumBoxes = 0;
                  prevState = _.cloneDeep(field);

                  numBoxesSoFar = 0;
              } else {
                  numBoxesSoFar = prevNumBoxes;
                  field = _.cloneDeep(prevState);

                  prevNumBoxes = prevPrevNumBoxes;
                  prevState = _.cloneDeep(prevPrevState);
              }
          }
      }

      runNumber++;

      if (runNumber % 1 === 0) {
          //console.log(runNumber, numBoxesSoFar);
          //console.log("path: ",currentPath);
          //console.log("numBoxesSoFar: ",numBoxesSoFar)
      }

      if (runNumber % 10 === 0) {
          //visualizeField(field, width, height).then((visualized) => setField(visualized));
        //postMessage(field);
      }

      if (runNumber % 3000 === 0) {
          break;
      }


      if (prevNumBoxes === prevPrevNumBoxes && prevNumBoxes === numBoxesSoFar) {
          theSequence = findSequenceOfLengthBest(width * height, boxOptions.map(x => x.split(",")[2]), numBoxes, boxOptions);
          //let theSequence = generateSequence(width * height, boxSizes, numBoxes);
          theSequence.sort((a, b) => b - a);

          if(theSequence.length == 0){
            //console.log("Non seq")
            theSequence = findSequenceOfLengthSecondBest(width * height, boxSizes, numBoxes, boxOptions);

            if(theSequence.length == 0){
              postMessage(null)
            }
          }

          //setSequence(theSequence.toString())

          field = createField(width, height);

          prevPrevNumBoxes = 0;
          prevPrevState = _.cloneDeep(field);

          prevNumBoxes = 0;
          prevState = _.cloneDeep(field);

          numBoxesSoFar = 0;
          currentPath = [];
      }
    }

    //visualizeField(field, width, height).then((visualized) => setField(visualized));

  }

  
  // Post the result back to the main thread
  if(theSequence.length > 0){
    postMessage(field);
  }
};