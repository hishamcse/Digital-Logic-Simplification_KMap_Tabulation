import {solverFunc} from "./KMapSolver/FinalSolver.js";
import {generateQMTable, generateCoverageTable} from "./QuineMcCluskeyTable.js";

// elements
const $kmap = document.querySelector('.kmap');
const $inputNamesField = document.querySelector('#inputName');
const $termFormatField = document.querySelector('#select');
const $allTermsField = document.querySelector('#allTerms');
const $dontCaresField = document.querySelector('#dontcares');
const $SOPField = document.querySelector('#SOPRadio');
const $POSField = document.querySelector('#POSRadio');

// templates
const $kmapTemplate = document.querySelector('#kmap-template').innerHTML;
const $QMTableTemplate = document.querySelector('#quine-template').innerHTML;
const $coverageTemplate = document.querySelector('#coverage-template').innerHTML;
const $answerTemplate = document.querySelector('#answer-template').innerHTML;

const checkPresence = () => {
    if ($inputNamesField.value.length === 0) {
        return {err: 'InputNames should be provided'}
    }

    if ($allTermsField.value.length === 0) {
        return {err: 'minterms should be provided'}
    }

    if (!$SOPField.checked && !$POSField.checked) {
        return {err: 'You must select the form of simplified expression'}
    }

    return {err: undefined}
}

const checkValidityAndStore = () => {

    // inputNames validity and store
    const inputNames = $inputNamesField.value.split(',').map(name => name.trim());
    for (let i = 0; i < inputNames.length; i++) {
        const name = inputNames[i];
        if (name.length !== 1) {
            return {error: 'Variable should consist of only one term'}
        }
        if (Number.isInteger(parseInt(name)) || name.toLowerCase() === name.toUpperCase()) {
            return {error: 'Variable should be only english alphabets'}
        }
    }

    // minterm / maxterm
    const termFormat = $termFormatField.value;

    // minterms / maxterms
    let terms = $allTermsField.value.split(',').map(name => name.trim());
    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        if (term.length === 0 || !Number.isInteger(parseInt(term))) {
            return {error: 'Variable should be only numbers'}
        }
        if (parseInt(term) >= Math.pow(2, inputNames.length)) {
            return {error: 'minterm out of range'}
        }
    }
    terms = terms.map(term => parseInt(term)).sort();

    let minterms = [];
    if (termFormat === 'minterm') {
        minterms = terms
    } else {
        for (let i = 0; i < Math.pow(2, inputNames.length); i++) {
            if (terms.includes(i)) continue;
            minterms.push(i);
        }
    }
    minterms = [...new Set(minterms)];

    // dont cares
    terms = $dontCaresField.value.split(',').map(name => name.trim());
    if ($dontCaresField.value.length !== 0) {
        for (let i = 0; i < terms.length; i++) {
            const term = terms[i];
            if (term.length === 0 || !Number.isInteger(parseInt(term))) {
                return {error: 'Variable should be only numbers'}
            }
            if (parseInt(term) >= Math.pow(2, inputNames.length)) {
                return {error: 'dont care term out of range'}
            }
            if (minterms.includes(parseInt(term))) {
                return {error: 'Oops!! Common term/terms exist on both minterms and dontcares'}
            }
        }
    }
    let dontCares = terms.map(term => parseInt(term)).sort();
    dontCares = [...new Set(dontCares)]

    // SOP / POS
    let isSOP = false;
    if ($SOPField.checked) {
        isSOP = true;
    }

    return {
        inputNames, termFormat, minterms, dontCares, isSOP
    }
}

document.querySelector('.btn').addEventListener('click', (e) => {
    e.preventDefault();

    const {err} = checkPresence();
    if (err) {
        new bootstrap.Modal(document.querySelector('.fetch__modal')).show();
        document.querySelector('.fetch__error').textContent = err;
        return;
    }

    const {inputNames, minterms, dontCares, isSOP, error} = checkValidityAndStore();
    if (error) {
        new bootstrap.Modal(document.querySelector('.fetch__modal')).show();
        document.querySelector('.fetch__error').textContent = error;
        return;
    }
    minterms.sort((a, b) => parseInt(a) - parseInt(b));
    dontCares.sort((a, b) => parseInt(a) - parseInt(b));

    let {
        oneTerms,
        rowArr,
        colArr,
        KMapArr,
        QMArr,
        BinPIs,
        PIs,
        EPIs,
        solution,
        solutionColorArr
    } = solverFunc(inputNames.length, inputNames, minterms, dontCares, isSOP);

    // Render KMap
    const n = Math.log2(rowArr.length) | 0
    let rowInputNames = inputNames.slice(0, n).join(',')
    let colInputNames = inputNames.slice(n).join(',')

    let combinedArr = [];
    for (let i = 0; i < rowArr.length; i++) {
        const temp = [...KMapArr[i]]
        temp.forEach(t => {
            solutionColorArr.forEach(sol => {
                if (t.binary === sol.binTerm) {
                    t.color = sol.color
                }
            })
        });
        combinedArr.push({
            rowName: rowArr[i],
            cellVals: temp
        })
    }

    $kmap.innerHTML = ''

    const htmlKMap = Mustache.render($kmapTemplate, {
        rowInputNames, colInputNames, colArr, combinedArr
    })

    $kmap.insertAdjacentHTML('beforeend', htmlKMap);

    // Render Quine-McCluskey PI Table
    const QMTable = generateQMTable(QMArr, PIs, inputNames, KMapArr)

    let headerNames = ['Inputs'];
    for (let i = 1; i < QMTable.length; i++) {
        headerNames.push(`Comparison ${i}`);
    }

    let QMTableValues = []
    for (let j = 0; j < QMTable[0].length; j++) {
        let temp = []
        for (let i = 0; i < QMTable.length; i++) {
            if (QMTable[i][j]) {
                temp.push(QMTable[i][j]);
            }
        }
        QMTableValues.push(temp)
    }

    const htmlQM = Mustache.render($QMTableTemplate, {
        headerNames, QMTableValues
    })

    $kmap.insertAdjacentHTML('beforeend', htmlQM);

    // Coverage Table
    const combinedPIs = generateCoverageTable(PIs, EPIs, BinPIs, inputNames, KMapArr);

    const htmlCovering = Mustache.render($coverageTemplate, {
        minterms: oneTerms, combinedPIs
    })

    $kmap.insertAdjacentHTML('beforeend', htmlCovering);

    // Rendering Answer
    PIs = PIs.join(', ')
    EPIs = EPIs.join(', ')
    solution = 'F'.concat('(', inputNames.join(', '), ') = ', solution)

    const htmlAns = Mustache.render($answerTemplate, {
        PIs, EPIs, solution
    });

    $kmap.insertAdjacentHTML('beforeend', htmlAns);
})