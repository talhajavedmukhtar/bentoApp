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

// Function to visualize the field
const visualizeField = async (field,w,h) => {
  const size = 10 / (w > h ? w : 2*h);

  const boxSize = `${size}em`

  const visualizedField = [];
  for (let i = 0; i < field.length; i++) {
    const row = [];
    for (let j = 0; j < field[0].length; j++) {
      const color = field[i][j] === '**' ? '#FFFCF0' : await stringToColor(field[i][j]);
      row.push(
        <div
          key={`${i}-${j}`}
          style={{
            width: boxSize,
            height: boxSize,
            backgroundColor: color,
            padding: boxSize,
            marginRight: '0em',
            border: '1px solid #282726',
            display: 'inline-block',
          }}
        />
      );
    }
    visualizedField.push(<div key={i} style={{lineHeight: '0em'}}>{row}</div>);
  }
  return visualizedField;
};

// Create initial field when component mounts
useEffect(() => {
  const initialField = createField(width, height);
  visualizeField(initialField, width, height).then((visualized) => setField(visualized));
}, []);

useEffect(() => {
  console.log("Processing changed: ",processing)
}, [processing]);

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

  console.log("Nums: ",nums)

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

  console.log("Bento filled? ",numBoxesSoFar === numBoxes,numBoxesSoFar,numBoxes);

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
  console.log("Box ops: ",boxOptions, " size: ",size)
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
  console.log("Augmentation time!!! ", index)
  const fieldCopy = field.map(row => [...row]); // Deep copy of the field

  const boxOption = boxOptionString.split(",")
  const boxWidth = parseInt(boxOption[0]);
  const boxHeight = parseInt(boxOption[1]);

  const [x, y] = index;
  for (let i = x; i < x + boxHeight; i++) {
      for (let j = y; j < y + boxWidth; j++) {
          console.log("Augmentation time!!!XXX")
          fieldCopy[i][j] = `*${newChar}`;
      }
  }

  return fieldCopy;
}

onmessage = function (e) {
  // Receive the data sent from the main thread
  const { width, height, numBoxes, minSize, maxSize, boxOptions } = e.data;

  
  // Post the result back to the main thread
  postMessage(/* Result or status back to the main thread */);
};