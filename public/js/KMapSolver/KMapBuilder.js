const encode_grey = number => number ^ (number >> 1)

const determineGreyCode = vars => {
    const n = Math.pow(2, vars);
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr[i] = encode_grey(i).toString(2).padStart(vars, '0');
    }
    return arr;
}

const construct_KMap = (rowGreyCodes, colGreyCodes, oneMinterms, dontCares) => {
    const rowLen = rowGreyCodes.length;
    const colLen = colGreyCodes.length;
    let arrKMap = new Array(rowLen);
    let rowNum, colNum, decimalNum, val;

    for (let i = 0; i < rowLen; i++) {
        arrKMap[i] = new Array(colLen);
        rowNum = rowGreyCodes[i % rowLen];
        for (let j = 0; j < colLen; j++) {
            colNum = colGreyCodes[j % colLen];
            decimalNum = parseInt(`${rowNum}${colNum}`, 2)
            val = oneMinterms.includes(decimalNum) ? '1' : (dontCares.includes(decimalNum) ? '-' : '0')
            arrKMap[i][j] = {
                rowVal: rowNum,
                colVal: colNum,
                binary: `${rowNum}${colNum}`,
                decimal: decimalNum,
                value: val,
            }
        }
    }

    return {arrKMap, rowGreyCodes, colGreyCodes}
}

const KMap = (inputVars, oneMinterms, dontCares) => {
    let rowInput, columnInput, rowGreyCodes, colGreyCodes;

    if (inputVars % 2 === 0) {
        rowInput = inputVars / 2
        columnInput = inputVars / 2
    } else {
        rowInput = Math.trunc(inputVars / 2)
        columnInput = Math.trunc(inputVars / 2) + 1
    }

    rowGreyCodes = determineGreyCode(rowInput)
    colGreyCodes = determineGreyCode(columnInput)

    return construct_KMap(rowGreyCodes, colGreyCodes, oneMinterms, dontCares);
}

export {
    KMap
}