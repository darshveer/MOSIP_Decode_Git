// printed.js
const { EasyOCR } = require('node-easyocr');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// --- Configuration ---
const IMAGE_PATH = "Images/i1.png";
const OUTPUT_JSON_PATH = 'extracted_data.json';
const WARMUP_SCRIPT_PATH = "warmup.py";
const FLAG_FILE_PATH = ".models_installed";

function checkAndWarmup() {
    if (fs.existsSync(FLAG_FILE_PATH)) {
        return;
    }
    console.log('Models not found. Running one-time warm-up script...');
    const pythonProcess = spawnSync('python3', [WARMUP_SCRIPT_PATH], { stdio: 'inherit' });
    if (pythonProcess.status === 0) {
        fs.writeFileSync(FLAG_FILE_PATH, 'done');
    } else {
        throw new Error('Python warm-up script failed.');
    }
}

async function main() {
    try {
        checkAndWarmup();
        const ocr = new EasyOCR();
        await ocr.init(['en']);
        console.log(`Processing image: ${IMAGE_PATH}`);
        const result = await ocr.readText(IMAGE_PATH);
        console.log('Text extraction complete.');
        
        // The raw OCR result is already sorted vertically.
        const allText = result.map(item => item.text);

        // --- START: RELIABLE LABEL-VALUE PAIRING ---
        const extractedData = {};
        
        // Define the specific labels we are looking for.
        const knownLabels = ["Name", "Age", "Gender", "Address", "Email Id", "Phone number"];

        // Loop through the text to find our known labels.
        for (let i = 0; i < allText.length; i++) {
            const currentText = allText[i];

            // If the current text is one of our known labels...
            if (knownLabels.includes(currentText)) {
                // ...the value is the very next item in the array.
                let value = allText[i + 1] || "";

                // Special handling for the two-part 'Address'.
                if (currentText === "Address") {
                    const addressLine2 = allText[i + 2] || "";
                    value = `${value} ${addressLine2}`;
                    i++; // Manually advance the loop to skip the second address line.
                }
                
                extractedData[currentText] = value;
                i++; // Manually advance the loop to skip the value we just processed.
            }
        }
        // --- END: RELIABLE LABEL-VALUE PAIRING ---
        
        fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(extractedData, null, 4));
        console.log(`\n✅ Data successfully saved to ${OUTPUT_JSON_PATH}`);
        await ocr.close();

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main();