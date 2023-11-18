import React, {useState, useEffect} from 'react';
import './App.css'; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

function App() {
  const _ = require('lodash');

  const firebaseConfig = {
  apiKey: "AIzaSyDs7OhdjYAaLsZeDBEXyxi3hGxfIVEmnac",
  authDomain: "bento-app-b64c5.firebaseapp.com",
  projectId: "bento-app-b64c5",
  storageBucket: "bento-app-b64c5.appspot.com",
  messagingSenderId: "738546689884",
  appId: "1:738546689884:web:1dbe62feaa2770b7d48399",
  measurementId: "G-4N1P5BG8ZF"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const [width, setWidth] = useState(8)
  const [height, setHeight] = useState(4)
  const [numBoxes, setNumBoxes] = useState(8)
  const [minSize, setMinSize] = useState(2)
  const [maxSize, setMaxSize] = useState(4)

  const [sequence, setSequence] = useState([])
  const [field, setField] = useState([]);
  const [processing, setProcessing] = useState(false)

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

  function findSequenceOfLengthBest(number, numbers, length, boxOptions) {
    const nums = [];

    for (let i = 0; i < boxOptions.length; i++) {
      const size = boxOptions[i].split(",")[2];

      if (numbers.includes(size)) {
        nums.push(size);
      }
    }

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


  // Handle generating a new field
  const handleGenerateField = async () => {
    await setProcessing(true);

    let field = createField(width, height);

    const boxOptions = getBoxOptions(minSize, maxSize, width, height);

    const boxSizes = boxOptions.map((x) => x[2]);

    let theSequence = findSequenceOfLengthBest(width * height, boxSizes, numBoxes, boxOptions);
    theSequence.sort((a, b) => b - a);

    setSequence(theSequence.toString());

    let prevPrevState = _.cloneDeep(field);
    let prevState = _.cloneDeep(field);

    let prevPrevNumBoxes = 0;
    let prevNumBoxes = 0;
    const forbiddenPathsDict = {};
    let runNumber = 0;

    let numBoxesSoFar = 0
    let currentPath = []

    while (!bentoIsFilledAppropriately(field, numBoxesSoFar, numBoxes)) {
      const relevantBoxSize = theSequence[numBoxesSoFar];
      const relevantBoxOptions = getBoxOptionsFromSize(minSize, maxSize, relevantBoxSize, width, height);

      let newBoxCanBeAdded = false;
      let newBoxOption = null;
      let newBoxIndex = null;

      console.log("relevantBoxSize: ",relevantBoxSize);
      console.log("relevantBoxOptions: ",relevantBoxOptions);

      for (const boxOption of relevantBoxOptions) {
          const candidateIndices = findCandidateIndices(field, boxOption);
          console.log("candidateIndices: ",candidateIndices);
          const validCandidateIndices = [];

          for (const candidateIndex of candidateIndices) {
              const pathStr = `${candidateIndex},${boxOption}`;
              if (!retrieveForbiddenPaths(forbiddenPathsDict, String(currentPath)).includes(pathStr)) {
                  console.log("ValidCandidate: ",candidateIndex,boxOption)
                  validCandidateIndices.push(candidateIndex);
              }
          }

          if (validCandidateIndices.length > 0) {
              newBoxCanBeAdded = true;
              newBoxOption = boxOption;
              newBoxIndex = validCandidateIndices[Math.floor(Math.random() * validCandidateIndices.length)];
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
          console.log(runNumber, numBoxesSoFar);
          console.log("path: ",currentPath);
          console.log("numBoxesSoFar: ",numBoxesSoFar)
      }

      if (runNumber % 10 === 0) {
          visualizeField(field, width, height).then((visualized) => setField(visualized));
      }

      if (runNumber % 10 === 0) {
          break;
      }


      if (prevNumBoxes === prevPrevNumBoxes && prevNumBoxes === numBoxesSoFar) {
          theSequence = findSequenceOfLengthBest(width * height, boxOptions.map(x => x[2]), numBoxes, boxOptions);
          theSequence.sort((a, b) => b - a);

          setSequence(theSequence.toString())

          field = createField(width, height);

          prevPrevNumBoxes = 0;
          prevPrevState = _.cloneDeep(field);

          prevNumBoxes = 0;
          prevState = _.cloneDeep(field);

          numBoxesSoFar = 0;
          currentPath = [];
      }
    }

    visualizeField(field, width, height).then((visualized) => setField(visualized));
    setProcessing(false)
  };



  return (
    <div className="app">

      <div className="heading">
        <h3> 弁当屋 🍱 </h3> 
      </div>

      <div className="inputs">
        {/* Four Number Input Fields */}
        <div>
          <label htmlFor="width">Width:</label>
          <br />
          <input type="number" id="width" placeholder={width} value={width} onChange={handleWidthChange} min="2" />
        </div>
        <div>
          <label htmlFor="height">Height:</label>
          <br />
          <input type="number" id="height" placeholder={height} value={height} onChange={handleHeightChange} min="2"/>
        </div>
        <div>
          <label htmlFor="input3">Num Boxes:</label>
          <br />
          <input type="number" id="input3" placeholder={numBoxes} value={numBoxes} onChange={handleNumBoxesChange} min="1"/>
        </div>
        <div>
          <label htmlFor="input4">Min Size:</label>
          <br />
          <input type="number" id="input4" placeholder={minSize} value={minSize} onChange={handleMinSizeChange} min="1"/>
        </div>
        <div>
          <label htmlFor="input5">Max Size:</label>
          <br />
          <input type="number" id="input5" placeholder={maxSize} value={maxSize} onChange={handleMaxSizeChange} min="1"/>
        </div>

        <button onClick={handleGenerateField}> Generate </button>
      </div>

      <div className="bentoArea">
        {(processing ? "Please wait..." : "Oh")}
        <br/>
        <br/>
        {(sequence.length > 0 ? sequence : "Invalid num of boxes")}
        <br/>
        <br/>
        <br/>
        {field}
      </div>
      
    </div>
  );
}

export default App;
