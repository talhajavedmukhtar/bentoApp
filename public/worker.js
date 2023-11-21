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

function isAtLeastMAdjacentInAllRectangles(field,width,height){
  return (isAtLeastMAdjacentInAllRectanglesHorizontal(field,width) && isAtLeastMAdjacentInAllRectanglesVertical(field,height));
}

function isAtLeastMAdjacentInAllRectanglesVertical(field, minSize) {
  const rows = field.length;
  const cols = field[0].length;

  // Helper function to perform DFS
  function dfs(row, col, visited) {
    if (
      row < 0 || row >= rows ||
      col < 0 || col >= cols ||
      visited[row][col] || field[row][col] !== "**"
    ) {
      return 0;
    }

    visited[row][col] = true;

    let count = 1;
    count += dfs(row - 1, col, visited); // Up
    count += dfs(row + 1, col, visited); // Down
    //count += dfs(row, col - 1, visited); // Left
    //count += dfs(row, col + 1, visited); // Right

    return count;
  }

  // Check all possible rectangles in the field
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (field[i][j] === "**") {
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const count = dfs(i, j, visited);

        if (count > 0 && count < minSize) {
          return false; // Rectangle found but not meeting minSize requirement
        }
      }
    }
  }

  return true; // All rectangles in the field meet the minSize requirement
}

function isAtLeastMAdjacentInAllRectanglesHorizontal(field, minSize) {
  const rows = field.length;
  const cols = field[0].length;

  // Helper function to perform DFS
  function dfs(row, col, visited) {
    if (
      row < 0 || row >= rows ||
      col < 0 || col >= cols ||
      visited[row][col] || field[row][col] !== "**"
    ) {
      return 0;
    }

    visited[row][col] = true;

    let count = 1;
    //count += dfs(row - 1, col, visited); // Up
    //count += dfs(row + 1, col, visited); // Down
    count += dfs(row, col - 1, visited); // Left
    count += dfs(row, col + 1, visited); // Right

    return count;
  }

  // Check all possible rectangles in the field
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (field[i][j] === "**") {
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const count = dfs(i, j, visited);

        if (count > 0 && count < minSize) {
          return false; // Rectangle found but not meeting minSize requirement
        }
      }
    }
  }

  return true; // All rectangles in the field meet the minSize requirement
}


function hasWHAdjacentEmpty(matrix, W, H) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      if (matrix[i][j] === '**') {
        let countWidth = 0;
        let countHeight = 0;

        // Check adjacent empty spots to the right
        for (let k = j; k < cols && matrix[i][k] === '**'; k++) {
          countWidth++;
        }

        // Check adjacent empty spots downwards
        for (let k = i; k < rows && matrix[k][j] === '**'; k++) {
          countHeight++;
        }

        if (countWidth === W && countHeight === H) {
          continue;
        } else {
          return false;
        }
      }
    }
  }

  return true;
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


function delay(iterations) {
  let toy = 0

  for (let i = 0; i < iterations; i++) {
    if (i % 1 === 0) {
      toy += 1
    }
  }

  return toy
}

function checkMinDimensions(matrix, minNumber) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let smallestWidth = Infinity;
  let smallestHeight = Infinity;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] === '**') {
        let width = 1;
        let height = 1;

        // Calculate width
        for (let k = j + 1; k < cols && matrix[i][k] === '**'; k++) {
          width++;
        }

        // Calculate height
        for (let k = i + 1; k < rows && matrix[k][j] === '**'; k++) {
          height++;
        }

        if (width < smallestWidth) {
          smallestWidth = width;
        }
        if (height < smallestHeight) {
          smallestHeight = height;
        }
      }
    }
  }

  console.log("Threshes: ",smallestWidth,smallestHeight)

  if (smallestWidth < minNumber || smallestHeight < minNumber) {
    return false;
  }

  return true;
}

function base(e) {
  // Receive the data sent from the main thread
  const { width, height, numBoxes, minSize, maxSize } = e.data;

  let field = createField(width, height);

  const boxOptions = getBoxOptions(minSize, maxSize, width, height);

  const boxSizes = boxOptions.map((x) => x.split(",")[2]);

  //console.log("Box options: ",boxOptions);
  //console.log("Box sizes: ",boxSizes);

  let theSequence = findSequenceOfLengthBest(width * height, boxSizes, numBoxes, boxOptions);
  //let theSequence = generateSequence(width * height, boxSizes, numBoxes);
  shuffle(theSequence);
  //theSequence.sort((a, b) => b - a);

  let triedSequences = 1

  //console.log("Sequence: ",theSequence)

  if(theSequence.length == 0){
    //console.log("Non seq")
    theSequence = findSequenceOfLengthSecondBest(width * height, boxSizes, numBoxes, boxOptions);

    if(theSequence.length == 0){
      postMessage(null)
    }else{
      triedSequences += 1
      postMessage({"sequence": theSequence, "id": triedSequences})
    }
  }else{
    triedSequences += 1
    postMessage({"sequence": theSequence, "id": triedSequences})
  }

  //setSequence(theSequence.toString());

  let stateStack = []

  let prevPrevState = _.cloneDeep(field);
  let prevState = _.cloneDeep(field);

  let prevPrevNumBoxes = 0;
  let prevNumBoxes = 0;

  stateStack.push({"numBoxes":0, "field":_.cloneDeep(field)})

  const forbiddenPathsDict = {};
  const forbiddenSequencesSet = new Set();
  let runNumber = 0;

  let numBoxesSoFar = 0
  let currentPath = []

  let stucknessMeter = 0
  let maxBoxes = 0
  let maxBoxesBeenSame = 0
  let popFactor = 10

  if(theSequence.length > 0){
    while (!bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)) {
      const relevantBoxSize = theSequence[numBoxesSoFar];
      const relevantBoxOptions = getBoxOptionsFromSize(minSize, maxSize, relevantBoxSize, width, height);

      shuffle(relevantBoxOptions)

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
              console.log("Path str: ",pathStr)
              if (!retrieveForbiddenPaths(forbiddenPathsDict, String(currentPath)).includes(pathStr)) {
                  ////console.log("ValidCandidate: ",candidateIndex,boxOption)
                  validCandidateIndices.push(candidateIndex);
              }
          }

          validCandidateIndices.sort((a, b) => {
            if (a[1] === b[1]) {
              return a[0] - b[0]; // Sort by x if y coordinates are equal
            }
            return a[1] - b[1]; // Otherwise, sort by y
          });

          if (validCandidateIndices.length > 0) {
              newBoxCanBeAdded = true;
              newBoxOption = boxOption;
              const randomIndex = /*Math.floor(Math.random() * validCandidateIndices.length)*/ 0
              //console.log("vc length: ",validCandidateIndices.length)
              //console.log("randomIndex: ",randomIndex)
              newBoxIndex = validCandidateIndices[randomIndex];

              console.log("About to shoot shot::: index: ",newBoxIndex," box: ",newBoxOption, " all indices: ",JSON.stringify(validCandidateIndices)," forbiddenPathsDict: ",JSON.stringify(forbiddenPathsDict))
              
              /*if (validCandidateIndices.some(index => index[0] === 0 && index[1] === 0)) {
                newBoxIndex = [0, 0];
              } else {
                newBoxIndex = validCandidateIndices[Math.floor(Math.random() * validCandidateIndices.length)];
              }*/
              break;
          }
      }

      if (newBoxCanBeAdded) {
          const augmentedField = augmentWithBox(field, newBoxIndex, newBoxOption, numBoxesSoFar);
          field = _.cloneDeep(augmentedField);

          if(!isAtLeastMAdjacentInAllRectangles(field,Math.min(...theSequence))){
            if(stateStack.length != 0){
              prevStateFromStack = stateStack.pop()

              numBoxesSoFar = prevStateFromStack["numBoxes"]
              field = _.cloneDeep(prevStateFromStack["field"]);

              maxBoxes = numBoxesSoFar
              maxBoxesBeenSame = 0
              postMessage({"maxBoxes": maxBoxes, "beenSame":maxBoxesBeenSame})
            } else {
              field = createField(width, height);

              prevPrevNumBoxes = 0;
              prevPrevState = _.cloneDeep(field);

              prevNumBoxes = 0;
              prevState = _.cloneDeep(field);

              numBoxesSoFar = 0;

              //
              stateStack = []
              currentPath = []
              stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
              ///
            }

            storeForbiddenPath(forbiddenPathsDict, String(currentPath), newBoxIndex, newBoxOption);


          } else {
            //
            stateStack.push({"numBoxes":numBoxesSoFar+1, "field":_.cloneDeep(field)})

            numBoxesSoFar++;

            if(numBoxesSoFar <= maxBoxes){
              maxBoxesBeenSame += 1
              postMessage({"maxBoxes": maxBoxes, "beenSame":maxBoxesBeenSame})
            }else{
              maxBoxes = numBoxesSoFar
              maxBoxesBeenSame = 0
              postMessage({"maxBoxes": maxBoxes, "beenSame":maxBoxesBeenSame})
            }
            ///
            /// 

            currentPath.push([newBoxOption, newBoxIndex]);
          }

          /*
          //
          stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})

          if(numBoxesSoFar <= maxBoxes){
            maxBoxesBeenSame += 1
            postMessage({"maxBoxes": maxBoxes, "beenSame":maxBoxesBeenSame})
          }else{
            maxBoxes = numBoxesSoFar
            maxBoxesBeenSame = 0
            postMessage({"maxBoxes": maxBoxes, "beenSame":maxBoxesBeenSame})
          }
          ///*/

          
      } else {
          if (currentPath.length === 0) {
              field = createField(width, height);

              prevPrevNumBoxes = 0;
              prevPrevState = _.cloneDeep(field);

              prevNumBoxes = 0;
              prevState = _.cloneDeep(field);

              numBoxesSoFar = 0;

              //
              stateStack = []
              stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
              ///
          } else {
              const [lastBoxPosition, lastBoxOption] = currentPath.pop();

              storeForbiddenPath(forbiddenPathsDict, String(currentPath), lastBoxPosition, lastBoxOption);

              if (currentPath.length === 0 || stateStack.length === 0) {
                  field = createField(width, height);

                  prevPrevNumBoxes = 0;
                  prevPrevState = _.cloneDeep(field);

                  prevNumBoxes = 0;
                  prevState = _.cloneDeep(field);

                  numBoxesSoFar = 0;

                  //
                  stateStack = []
                  stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
                  ///
                  /// 
                  /// 
              } else {
                  numBoxesSoFar = prevNumBoxes;
                  field = _.cloneDeep(prevState);

                  prevNumBoxes = prevPrevNumBoxes;
                  prevState = _.cloneDeep(prevPrevState);

                  //
                  prevStateFromStack = stateStack.pop()
                  prevStateFromStack = stateStack.pop()
                  numBoxesSoFar = prevStateFromStack["numBoxes"]
                  field = _.cloneDeep(prevStateFromStack["field"]);
                  ///
                  /// 
              }
          }
      }

      runNumber++;

      if (runNumber % 1 === 0) {
          //console.log(runNumber, numBoxesSoFar);
          //console.log("path: ",currentPath);
          //console.log("numBoxesSoFar: ",numBoxesSoFar)
      }

      if (runNumber % 1 === 0) {
        //visualizeField(field, width, height).then((visualized) => setField(visualized));
        postMessage(field);
        postMessage({"currentPath": currentPath})
        delay(1000000000);
      }

      if (runNumber % 100000 === 0) {
          break;
      }


      if (prevNumBoxes === prevPrevNumBoxes && prevNumBoxes === numBoxesSoFar) {

        if (stucknessMeter > 10000){
          stucknessMeter = 0;

          forbiddenSequencesSet.add(theSequence.sort((a, b) => b - a))

          while(forbiddenSequencesSet.has(theSequence.sort((a, b) => b - a))){
            theSequence = findSequenceOfLengthBest(width * height, boxOptions.map(x => x.split(",")[2]), numBoxes, boxOptions);
            //let theSequence = generateSequence(width * height, boxSizes, numBoxes);
            theSequence.sort((a, b) => b - a);

            if(theSequence.length == 0){
              //console.log("Non seq")
              theSequence = findSequenceOfLengthSecondBest(width * height, boxSizes, numBoxes, boxOptions);

              if(theSequence.length == 0){
                postMessage(null)
              } else {
                triedSequences += 1
                postMessage({"sequence": theSequence, "id": triedSequences})
              }
            }else{
              triedSequences += 1
              postMessage({"sequence": theSequence, "id": triedSequences})
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

          //
          stateStack = []
          stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
          ///
        }else{
          stucknessMeter += 1
        }
          
      }

      //
      if(maxBoxesBeenSame > 500){
        //
        for (let i = 0; i < popFactor; i++) {
          if (stateStack.length > 1) {
            prevStateFromStack = stateStack.pop()
          }
        }
        
        numBoxesSoFar = prevStateFromStack["numBoxes"]
        field = _.cloneDeep(prevStateFromStack["field"]);

        maxBoxes = numBoxesSoFar
        maxBoxesBeenSame = 0
        postMessage({"maxBoxes": maxBoxes, "beenSame":maxBoxesBeenSame})
        ///
      }
      ///

      //console.log("Posting run number: ",runNumber);
      postMessage(runNumber);
    }

    //visualizeField(field, width, height).then((visualized) => setField(visualized));

  }

  
  // Post the result back to the main thread
  if(theSequence.length > 0){
    if(bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)){
      postMessage(field);
      postMessage("complete");
    }else{
      postMessage("partial");
    }
  }

};


function dos(e) {
  // Receive the data sent from the main thread
  const { width, height, numBoxes, minSize, maxSize } = e.data;

  let field = createField(width, height);

  const boxOptions = getBoxOptions(minSize, maxSize, width, height);

  const boxSizes = boxOptions.map((x) => x.split(",")[2]);

  let theSequence = findSequenceOfLengthBest(width * height, boxSizes, numBoxes, boxOptions);
  shuffle(theSequence);
  //theSequence.sort((a, b) => b - a);

  let triedSequences = 1


  if(theSequence.length == 0){
    //console.log("Non seq")
    theSequence = findSequenceOfLengthSecondBest(width * height, boxSizes, numBoxes, boxOptions);

    if(theSequence.length == 0){
      postMessage(null)
    }else{
      triedSequences += 1
      postMessage({"sequence": theSequence, "id": triedSequences})
    }
  }else{
    triedSequences += 1
    postMessage({"sequence": theSequence, "id": triedSequences})
  }

  let stateStack = []

  stateStack.push({"numBoxes":0, "field":_.cloneDeep(field)})

  const forbiddenPathsDict = {};
  const forbiddenSequencesSet = new Set();
  let runNumber = 0;

  let numBoxesSoFar = 0
  let currentPath = []

  let stucknessMeter = 0

  if(theSequence.length > 0){
    while (!bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)) {
      const relevantBoxSize = theSequence[numBoxesSoFar];
      const relevantBoxOptions = getBoxOptionsFromSize(minSize, maxSize, relevantBoxSize, width, height);

      shuffle(relevantBoxOptions)

      let newBoxCanBeAdded = false;
      let newBoxOption = null;
      let newBoxIndex = null;

      for (const boxOption of relevantBoxOptions) {
          const candidateIndices = findCandidateIndices(field, boxOption);
          const validCandidateIndices = [];

          for (const candidateIndex of candidateIndices) {
              const pathStr = `${candidateIndex},${boxOption}`;
              if (!retrieveForbiddenPaths(forbiddenPathsDict, String(currentPath)).includes(pathStr)) {
                  validCandidateIndices.push(candidateIndex);
              }
          }

          validCandidateIndices.sort((a, b) => {
            if (a[1] === b[1]) {
              return a[0] - b[0]; 
            }
            return a[1] - b[1]; 
          });

          if (validCandidateIndices.length > 0) {
              newBoxCanBeAdded = true;
              newBoxOption = boxOption;
              newBoxIndex = validCandidateIndices[0];

              console.log("About to shoot shot::: index: ",newBoxIndex," box: ",newBoxOption, " all indices: ",JSON.stringify(validCandidateIndices)," forbiddenPathsDict: ",JSON.stringify(forbiddenPathsDict))
              
              break;
          }
      }

      if (newBoxCanBeAdded) {
          const augmentedField = augmentWithBox(field, newBoxIndex, newBoxOption, numBoxesSoFar);
          field = _.cloneDeep(augmentedField);

          if(!isAtLeastMAdjacentInAllRectangles(field,Math.min(...theSequence.slice(numBoxesSoFar)))){
            storeForbiddenPath(forbiddenPathsDict, String(currentPath), newBoxIndex, newBoxOption);
            if(stateStack.length != 0){
              prevStateFromStack = stateStack.pop()
              //currentPath.pop()

              numBoxesSoFar = prevStateFromStack["numBoxes"]
              field = _.cloneDeep(prevStateFromStack["field"]);
            } else {
              field = createField(width, height);

              numBoxesSoFar = 0;

              //
              stateStack = []
              currentPath = []
              stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
              ///
            }


          } else {
            //
            stateStack.push({"numBoxes":numBoxesSoFar+1, "field":_.cloneDeep(field)})

            numBoxesSoFar++;
            ///
            /// 

            currentPath.push([newBoxOption, newBoxIndex]);
          }
          
      } else {
          if (currentPath.length === 0) {
              field = createField(width, height);

              numBoxesSoFar = 0;

              //
              stateStack = []
              stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
              ///
          } else {
              const [lastBoxPosition, lastBoxOption] = currentPath.pop();

              storeForbiddenPath(forbiddenPathsDict, String(currentPath), lastBoxPosition, lastBoxOption);

              if (currentPath.length === 0 || stateStack.length === 0) {
                  field = createField(width, height);

                  numBoxesSoFar = 0;

                  //
                  stateStack = []
                  stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
                  ///
              } else {
                  //
                  prevStateFromStack = stateStack.pop()
                  currentPath.pop()
                  numBoxesSoFar = prevStateFromStack["numBoxes"]
                  field = _.cloneDeep(prevStateFromStack["field"]);
                  ///
                  /// 
              }
          }
      }

      runNumber++;

      if (runNumber % 1 === 0) {
        postMessage(field);
        postMessage({"currentPath": currentPath})
        delay(1000000000);
      }

      if (runNumber % 100000 === 0) {
          break;
      }

      postMessage(runNumber);
    }

  }

  
  // Post the result back to the main thread
  if(theSequence.length > 0){
    if(bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)){
      postMessage(field);
      postMessage("complete");
    }else{
      postMessage("partial");
    }
  }

};

onmessage = function (e) {
  // Receive the data sent from the main thread
  const { width, height, numBoxes, minSize, maxSize } = e.data;

  let field = createField(width, height);

  const boxOptions = getBoxOptions(minSize, maxSize, width, height);

  const boxSizes = boxOptions.map((x) => x.split(",")[2]);

  let theSequence = findSequenceOfLengthBest(width * height, boxSizes, numBoxes, boxOptions);
  shuffle(theSequence);
  //theSequence.sort((a, b) => b - a);

  let triedSequences = 1


  if(theSequence.length == 0){
    //console.log("Non seq")
    theSequence = findSequenceOfLengthSecondBest(width * height, boxSizes, numBoxes, boxOptions);

    if(theSequence.length == 0){
      postMessage(null)
    }else{
      triedSequences += 1
      postMessage({"sequence": theSequence, "id": triedSequences})
    }
  }else{
    triedSequences += 1
    postMessage({"sequence": theSequence, "id": triedSequences})
  }

  let stateStack = []

  stateStack.push({"numBoxes":0, "field":_.cloneDeep(field), "currentPath": []})

  const forbiddenPathsDict = {};
  const forbiddenSequencesSet = new Set();
  let runNumber = 0;

  let numBoxesSoFar = 0
  let currentPath = []

  let stucknessMeter = 0

  if(theSequence.length > 0){
    while (!bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)) {
      const relevantBoxSize = theSequence[numBoxesSoFar];
      const relevantBoxOptions = getBoxOptionsFromSize(minSize, maxSize, relevantBoxSize, width, height);

      shuffle(relevantBoxOptions)

      let newBoxCanBeAdded = false;
      let newBoxOption = null;
      let newBoxIndex = null;

      for (const boxOption of relevantBoxOptions) {
          const candidateIndices = findCandidateIndices(field, boxOption);
          const validCandidateIndices = [];

          for (const candidateIndex of candidateIndices) {
              //const pathStr = `${candidateIndex},${boxOption}`;
              const pathStr = `${boxOption},${candidateIndex}`;
              console.log("Path str: ",pathStr)
              console.log("Retrieve: ",retrieveForbiddenPaths(forbiddenPathsDict, String(currentPath)))
              if (!retrieveForbiddenPaths(forbiddenPathsDict, String(currentPath)).includes(pathStr)) {
                  validCandidateIndices.push(candidateIndex);
              } else{
                console.log("Forbidden!!!")
              }
          }

          validCandidateIndices.sort((a, b) => {
            if (a[1] === b[1]) {
              return a[0] - b[0]; 
            }
            return a[1] - b[1]; 
          });

          if (validCandidateIndices.length > 0) {
              newBoxCanBeAdded = true;
              newBoxOption = boxOption;
              newBoxIndex = validCandidateIndices[0];

              console.log("About to shoot shot::: index: ",newBoxIndex," box: ",newBoxOption, " all indices: ",JSON.stringify(validCandidateIndices)," forbiddenPathsDict: ",JSON.stringify(forbiddenPathsDict))
              
              break;
          }
      }

      if (newBoxCanBeAdded) {
          const augmentedField = augmentWithBox(field, newBoxIndex, newBoxOption, numBoxesSoFar);
          field = _.cloneDeep(augmentedField);

          currentPath.push([newBoxOption, newBoxIndex])
          stateStack.push({"numBoxes":numBoxesSoFar+1, "field":_.cloneDeep(augmentedField), "currentPath": _.cloneDeep(currentPath)})

          numBoxesSoFar += 1;

          if(!isAtLeastMAdjacentInAllRectangles(field,minSize,minSize)){
          //if(!hasWHAdjacentEmpty(field,2,2)){
          //if(false){
            if (currentPath.length == 0){
              currentPath = [[null,null]]
            }

            const [lastBoxOption, lastIndex] = currentPath.pop();

            storeForbiddenPath(forbiddenPathsDict, String(currentPath), lastIndex, lastBoxOption);

            if(stateStack.length == 0){
              stateStack = []
              field = createField(width, height);
              stateStack.push({"numBoxes":0, "field":_.cloneDeep(field), "currentPath": []})
            }

            prevStateFromStack = stateStack.pop()
            numBoxesSoFar = _.cloneDeep(prevStateFromStack["numBoxes"])
            field = _.cloneDeep(prevStateFromStack["field"]);
            currentPath = _.cloneDeep(prevStateFromStack["currentPath"])
          } 
          
      } else {
        if (currentPath.length == 0){
          currentPath = [[null,null]]
        }

        const [lastBoxOption, lastIndex] = currentPath.pop();

        storeForbiddenPath(forbiddenPathsDict, String(currentPath), lastIndex, lastBoxOption);

        if(stateStack.length == 0){
          stateStack = []
          field = createField(width, height);
          stateStack.push({"numBoxes":0, "field":_.cloneDeep(field), "currentPath": []})
        }
        
        prevStateFromStack = stateStack.pop()
        numBoxesSoFar = _.cloneDeep(prevStateFromStack["numBoxes"])
        field = _.cloneDeep(prevStateFromStack["field"]);
        currentPath = _.cloneDeep(prevStateFromStack["currentPath"])
          /*if (currentPath.length === 0) {
              field = createField(width, height);

              numBoxesSoFar = 0;

              //
              stateStack = []
              stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
              ///
          } else {
              const [lastBoxOption, lastIndex] = currentPath.pop();

              storeForbiddenPath(forbiddenPathsDict, String(currentPath), lastIndex, lastBoxOption);

              if (currentPath.length === 0 || stateStack.length === 0) {
                  field = createField(width, height);

                  numBoxesSoFar = 0;

                  //
                  stateStack = []
                  stateStack.push({"numBoxes":numBoxesSoFar, "field":_.cloneDeep(field)})
                  ///
              } else {
                  //
                  prevStateFromStack = stateStack.pop()
                  numBoxesSoFar = prevStateFromStack["numBoxes"]
                  field = _.cloneDeep(prevStateFromStack["field"]);
                  ///
                  /// 
              }
          }*/
      }

      runNumber++;

      if (runNumber % 1 === 0) {
        //postMessage(field);
        //postMessage({"currentPath": currentPath})
        //delay(10000000);
      }

      if (runNumber % 10000 === 0) {
          break;
      }

      //postMessage(runNumber);
    }

  }

  
  // Post the result back to the main thread
  if(theSequence.length > 0){
    if(bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)){
      postMessage(field);
      postMessage("complete");
    }else{
      postMessage("partial");
    }
  }

};