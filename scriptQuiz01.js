/**
 * BFI-2-XS Personality Quiz (English Version - 15 Items)
 * Scoring uses the Summing method (Range 3-15 per domain).
 * The quiz uses a 5-point Likert scale (1 = Disagree strongly, 5 = Agree strongly).
 * --- DOG MATCHING LOGIC INCLUDED ---
 */

const BFI2XS_ITEMS = [
    // E (Extraversion)
    { id: 1, text: "คุณเป็นคนช่างพูด", domain: 'E', reverse: false },
    { id: 2, text: "คุณเป็นคนสงบเสงี่ยม", domain: 'E', reverse: true }, // Reverse-scored: reserved -> outgoing
    { id: 3, text: "คุณเต็มไปด้วยพลังงาน", domain: 'E', reverse: false },
    
    // A (Agreeableness)
    { id: 4, text: "คุณมักชอบจับผิดผู้อื่น", domain: 'A', reverse: true }, // Reverse-scored: finding fault -> agreeable
    { id: 5, text: "คุณเป็นคนชอบช่วยเหลือและไม่เห็นแก่ตัวต่อผู้อื่น", domain: 'A', reverse: false },
    { id: 6, text: "คุณมักเป็นฝ่ายชวนทะเลาะบ่อยครั้ง", domain: 'A', reverse: true }, // Reverse-scored: quarreling -> agreeable
    
    // C (Conscientiousness)
    { id: 7, text: "คุณเป็นคนทำงานอย่างละเอียดถี่ถ้วน", domain: 'C', reverse: false },
    { id: 8, text: "คุณมักประมาทเป็นบางครั้ง", domain: 'C', reverse: true }, // Reverse-scored: careless -> conscientious
    { id: 9, text: "คุณเป็นคนทำงานที่น่าเชื่อถือ", domain: 'C', reverse: false },
    
    // N (Negative Emotionality / Neuroticism)
    { id: 10, text: "คุณมักรู้สึกหดหู่ ซึมเศร้า", domain: 'N', reverse: false },
    { id: 11, text: "คุณเป็นคนผ่อนคลาย จัดการความเครียดได้ดี", domain: 'N', reverse: true }, // Reverse-scored: relaxed -> neurotic
    { id: 12, text: "คุณเป็นคนที่มีความเครียดได้ง่าย", domain: 'N', reverse: false },

    // O (Open-Mindedness / Openness)
    { id: 13, text: "คุณเป็นคนมีความคิดสร้างสรรค์ มักมีคิดไอเดียใหม่ ๆ เสมอ", domain: 'O', reverse: false },
    { id: 14, text: "คุณมักตั้งคำถามกับสิ่งต่าง ๆ รอบตัว", domain: 'O', reverse: false },
    { id: 15, text: "คุณเป็นคนเฉลียวฉลาด ความคิดซับซ้อน", domain: 'O', reverse: false }
];

const LIKERT_LABELS = [
    "ไม่เห็นด้วยอย่างยิ่ง (Disagree Strongly)", 
    "ไม่เห็นด้วยเล็กน้อย (Disagree A Little)", 
    "เป็นกลาง (Neutral)", 
    "เห็นด้วยเล็กน้อย (Agree A Little)", 
    "เห็นด้วยอย่างยิ่ง (Agree Strongly)"
];

// --- DOG CLUSTER DEFINITION (Based on previous K-Means Analysis) ---
const DOG_GROUPS = {
    // กลุ่ม 1: High-Energy Work/Sporting (พลังงานสูง & ฝึกง่าย)
    'HIGH_WORK': {
        groupName: "High-Energy Work/Sporting",
        dogPic: "pic/type01.png",
        description: "สุนัขที่ต้องการกิจกรรมและการออกกำลังกายในระดับสูงมาก ฉลาด และต้องการการฝึกฝนอย่างสม่ำเสมอ เหมาะสำหรับเจ้าของที่แอคทีฟ มีระเบียบวินัย และสนุกกับการทำกิจกรรมนอกบ้าน",
        exampleBreeds: ["Labrador Retriever", "German Shepherd", "Border Collie", "Golden Retriever"]
    },
    // กลุ่ม 2: Independent/Free-Spirited (อิสระ & เอาแต่ใจ)
    'INDEPENDENT': {
        groupName: "Independent/Free-Spirited",
        dogPic: "pic/type02.png",
        description: "สุนัขที่มีความเป็นตัวของตัวเองสูง อาจดื้อหรือเป็นจ่าฝูง ไม่เป็นมิตรกับคนแปลกหน้ามากนัก เหมาะกับเจ้าของที่มีความมั่นคงทางอารมณ์และอดทนในการฝึก",
        exampleBreeds: ["Siberian Husky", "Shiba Inu", "Chow Chow", "Akita"]
    },
    // กลุ่ม 3: Low-Energy Companion (เพื่อนคู่คิดพลังงานต่ำ)
    'LOW_COMPANION': {
        groupName: "Low-Energy Companion",
        dogPic: "pic/type03.png",
        description: "สุนัขที่สงบ, เป็นมิตร, และไม่ต้องการการออกกำลังกายที่เข้มงวด เหมาะสำหรับเจ้าของที่ชอบความสงบและมีไลฟ์สไตล์ที่เรียบง่าย",
        exampleBreeds: ["Maltese", "Shih Tzu", "Bulldog", "French Bulldog", "Pug"]
    },
    // กลุ่ม 4: Versatile/Medium-Alert (อเนกประสงค์/ปานกลาง)
    'VERSATILE': {
        groupName: "Versatile Companion",
        dogPic: "pic/type04.png",
        description: "สุนัขที่มีลักษณะผสมผสาน เข้าได้กับเจ้าของหลากหลายรูปแบบ ต้องการการดูแลปานกลาง เหมาะสำหรับมือใหม่หรือครอบครัวที่มีกิจกรรมปานกลาง",
        exampleBreeds: ["Poodle (Standard)", "Cavalier King Charles Spaniel", "Boxer", "Beagle"]
    }
};

let userAnswers = {}; // เก็บคำตอบ {q1: 3, q2: 5, ...}
let currentQuestionIndex = 0; // ติดตามคำถามปัจจุบัน (0 ถึง 14)

// =========================================================================
// 1. SCORING LOGIC
// =========================================================================

/**
 * ฟังก์ชันสำหรับกลับด้านคะแนน (Reverse Scoring)
 * BFI-2-XS ใช้ 5-point scale (1-5). สูตร: Reversed Score = 6 - Original Score
 * @param {number} originalScore - คะแนนเดิม (1 ถึง 5)
 * @returns {number} - คะแนนที่กลับด้านแล้ว
 */
function reverseScore(originalScore) {
    return 6 - originalScore;
}

/**
 * คำนวณคะแนน Big Five (Summing)
 * คะแนนสุดท้ายจะอยู่ในช่วง 3 ถึง 15
 * @returns {Object} - ผลรวมคะแนน Big Five ทั้ง 5 มิติ (E, A, C, N, O)
 */
function calculateBigFiveScores() {
    const scores = { E: 0, A: 0, C: 0, N: 0, O: 0 };

    BFI2XS_ITEMS.forEach(item => {
        const key = `q${item.id}`;
        // ดึงคะแนนที่บันทึกไว้ หรือใช้ค่าเริ่มต้น 3 (Neutral) หากไม่มีการตอบ
        const originalScore = userAnswers[key] !== undefined ? userAnswers[key] : 3;

        let scoredValue = originalScore;
        
        // 1. ทำการ Reverse-Scoring หากจำเป็น
        if (item.reverse) {
            scoredValue = reverseScore(originalScore);
        }

        // 2. สะสมคะแนน (Summing)
        scores[item.domain] += scoredValue;
    });

    return scores;
}

/**
 * แปลงคะแนน Big Five (3-15) เป็นระดับ (Low, Mid, High)
 * เกณฑ์: Low (3-6), Mid (7-11), High (12-15)
 * @param {number} score - คะแนนรวมของมิติ (3-15)
 * @returns {string} - 'Low', 'Mid', หรือ 'High'
 */
function getBigFiveLevel(score) {
    if (score >= 12) {
        return 'High';
    } else if (score >= 7) {
        return 'Mid';
    } else { // 3-6
        return 'Low';
    }
}

/**
 * ตรรกะหลักในการจับคู่บุคลิกภาพ Big Five ของเจ้าของกับกลุ่มสุนัข
 * @param {Object} scores - ผลรวมคะแนน Big Five ของเจ้าของ (E, A, C, N, O)
 * @returns {Object} - ข้อมูลกลุ่มสุนัขที่แนะนำ
 */
function matchUserToDogGroup(scores) {
    const levels = {
        E: getBigFiveLevel(scores.E),
        A: getBigFiveLevel(scores.A),
        C: getBigFiveLevel(scores.C),
        N: getBigFiveLevel(scores.N),
        O: getBigFiveLevel(scores.O)
    };

    // --- LOGIC TREE BASED ON MATCHING CRITERIA ---
    // (เน้นการจับคู่ความสอดคล้อง (E, C) และความสมดุล (N))

    // 1. HIGH-ENERGY WORK/SPORTING (กลุ่ม 1) - ต้องการเจ้าของที่ Active และมีวินัย
    if ((levels.E === 'High' && levels.C === 'High') || (levels.E === 'High' && levels.C === 'Mid')) {
        return DOG_GROUPS.HIGH_WORK;
    }

    // 2. LOW-ENERGY COMPANION (กลุ่ม 3) - เหมาะกับเจ้าของที่สงบและมั่นคง
    if ((levels.E === 'Low' && levels.N === 'Low') || (levels.E === 'Mid' && levels.N === 'Low')) {
        return DOG_GROUPS.LOW_COMPANION;
    }
    
    // 3. INDEPENDENT/FREE-SPIRITED (กลุ่ม 2) - เหมาะกับเจ้าของที่มั่นคงและอดทนต่อการฝึกฝน
    if ((levels.N === 'Low' && levels.A === 'Low') || (levels.N === 'Low' && levels.A === 'Mid')) {
        return DOG_GROUPS.INDEPENDENT;
    }

    // 4. VERSATILE COMPANION (กลุ่ม 4) - เหมาะกับเจ้าของที่มีลักษณะผสม หรือเจ้าของมือใหม่
    // ถ้าไม่เข้าเงื่อนไขเฉพาะเจาะจงด้านบน
    return DOG_GROUPS.VERSATILE;
}

// =========================================================================
// 2. UI RENDERING & QUIZ FLOW
// =========================================================================

/**
 * จัดการการเรนเดอร์หลัก (นำไปใช้แทน renderQuiz เดิม)
 */
function renderQuiz() {
    const totalQuestions = BFI2XS_ITEMS.length;
    
    // Check if we are done
    if (currentQuestionIndex < totalQuestions) {
        renderQuestion(currentQuestionIndex);
    } else {
        // อัปเดต Progress Bar เป็น 100% ก่อนเปลี่ยนหน้า
        updateProgressBar(); 
        submitQuiz(); // All questions answered
    }
}


/**
 * แสดงคำถามปัจจุบัน
 */
function renderQuestion(index) {
    const quizCont = document.getElementById('quiz');
    quizCont.innerHTML = ''; // Clear the quiz container for single question view

    const item = BFI2XS_ITEMS[index];
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('quiz-item', 'bg-white', 'p-6', 'md:p-8', 'rounded-xl', 'shadow-2xl', 'space-y-6', 'max-w-2xl', 'mx-auto', 'transition-opacity', 'duration-500');
    itemContainer.style.opacity = 0; // Start hidden for transition
    
    // ดึงคำตอบที่บันทึกไว้สำหรับคำถามข้อนี้ (สำคัญสำหรับการย้อนกลับ)
    let selectedValue = userAnswers[`q${item.id}`] || null;
    
    // คำถาม
    const questionText = document.createElement('p');
    questionText.classList.add('text-2xl', 'font-bold', 'mb-6', 'text-gray-800', 'text-center');
    questionText.innerHTML = `<span class="text-indigo-600">ข้อที่ ${item.id} จาก ${BFI2XS_ITEMS.length}:</span> ${item.text}`;
    itemContainer.appendChild(questionText);

    // --- การแก้ไข: สร้าง Wrapper สำหรับ Label ซ้าย/ขวา และ Scale ---
    const scaleWrapper = document.createElement('div');
    scaleWrapper.classList.add('flex', 'items-start', 'justify-between', 'space-x-4');
    
    // Label ซ้าย: ไม่เห็นด้วย
    const disagreeLabel = document.createElement('span');
    disagreeLabel.classList.add('text-sm', 'font-semibold', 'text-red-500', 'mt-4', 'w-1/6', 'text-left');
    disagreeLabel.textContent = 'ไม่เห็นด้วย';
    scaleWrapper.appendChild(disagreeLabel);

    // Linear Scale / Radio Group Container
    const scaleContainer = document.createElement('div');
    scaleContainer.classList.add('flex', 'justify-between', 'items-center', 'mt-4', 'scale-container', 'p-4', 'bg-indigo-50', 'rounded-lg', 'border', 'border-indigo-200', 'flex-1'); // flex-1 ให้ยืดเต็มพื้นที่

    LIKERT_LABELS.forEach((label, index) => {
        const value = index + 1; // 1-based scoring (1 to 5)
        const radioId = `q${item.id}-${value}`;

        const radioWrapper = document.createElement('label');
        // ใช้ 'group' เพื่อให้ tooltip ทำงาน
        radioWrapper.classList.add('flex', 'flex-col', 'items-center', 'cursor-pointer', 'p-2', 'flex-1', 'transition-colors', 'duration-200', 'rounded-md', 'relative', 'group'); 
        
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = `q${item.id}`; // Group by question
        radioInput.value = value;
        radioInput.id = radioId;
        radioInput.classList.add('sr-only'); 
        
        // Custom radio button visual
        const customRadio = document.createElement('div');
        customRadio.classList.add('w-6', 'h-6', 'rounded-full', 'border-2', 'border-gray-400', 'flex', 'items-center', 'justify-center', 'transition-all', 'duration-200', 'mt-2');
        customRadio.innerHTML = '<div class="w-3 h-3 rounded-full bg-indigo-600 scale-0 transition-transform duration-200"></div>';
        
        // กำหนดสถานะเริ่มต้นจากคำตอบที่บันทึกไว้
        if (selectedValue == value) {
            customRadio.classList.add('border-indigo-600');
            customRadio.querySelector('div').classList.add('scale-100');
            radioWrapper.classList.add('bg-indigo-200'); 
            radioInput.checked = true; 
        }

        // Add event listener to update visual state instantly
        radioInput.addEventListener('change', function() {
             selectedValue = parseInt(this.value);
             // Remove highlight from previous selection on all labels in this container
             const allWrappers = scaleContainer.querySelectorAll('label');
             allWrappers.forEach(w => w.classList.remove('bg-indigo-200'));
             const allCustomRadios = scaleContainer.querySelectorAll('.w-6.h-6');
             allCustomRadios.forEach(cr => {
                 cr.classList.remove('border-indigo-600');
                 cr.querySelector('div').classList.remove('scale-100');
             });

             // Apply highlight to current selection
             this.parentElement.classList.add('bg-indigo-200');
             customRadio.classList.add('border-indigo-600');
             customRadio.querySelector('div').classList.add('scale-100');
             
             // บันทึกคำตอบทันทีเมื่อมีการเปลี่ยนแปลง (เพื่อให้พร้อมสำหรับปุ่มย้อนกลับ)
             userAnswers[`q${item.id}`] = selectedValue;
        });

        const labelSpan = document.createElement('span');
        labelSpan.classList.add('text-xs', 'mt-1', 'text-center', 'font-medium', 'text-gray-700', 'scale-label');
        labelSpan.textContent = value; // แสดงหมายเลข 1-5

        const tooltipSpan = document.createElement('span');
        // ใช้ block/opacity/scale-90 สำหรับ transition
        tooltipSpan.classList.add('absolute', 'top-0', 'left-1/2', 'transform', '-translate-x-1/2', 'mt-[-3rem]', 'hidden', 'group-hover:block', 'group-focus-within:block', 'bg-gray-800', 'text-white', 'text-xs', 'rounded', 'px-2', 'py-1', 'whitespace-nowrap', 'opacity-0', 'scale-90', 'transition-all', 'tooltip', 'z-10');
        tooltipSpan.textContent = label; // แสดงคำแปลเต็ม

        radioWrapper.appendChild(tooltipSpan);
        radioWrapper.appendChild(radioInput); 
        radioWrapper.appendChild(customRadio); 
        radioWrapper.appendChild(labelSpan);
        scaleContainer.appendChild(radioWrapper);
    });

    scaleWrapper.appendChild(scaleContainer);

    // Label ขวา: เห็นด้วย
    const agreeLabel = document.createElement('span');
    agreeLabel.classList.add('text-sm', 'font-semibold', 'text-green-500', 'mt-4', 'w-1/6', 'text-right');
    agreeLabel.textContent = 'เห็นด้วย';
    scaleWrapper.appendChild(agreeLabel);

    itemContainer.appendChild(scaleWrapper);
    
    // Navigation Buttons Container
    const navButtonsContainer = document.createElement('div');
    navButtonsContainer.classList.add('flex', 'justify-between', 'mt-6', 'space-x-4', 'w-full'); // เพิ่ม w-full เพื่อยืดเต็มพื้นที่

    // ปุ่ม "ย้อนกลับ" (ซ้าย)
    const backButton = document.createElement('button');
    backButton.textContent = '◀️ ย้อนกลับ (Back)';
    backButton.classList.add('w-1/2', 'bg-gray-400', 'hover:bg-gray-500', 'text-white', 'font-bold', 'py-3', 'px-4', 'rounded-lg', 'transition-colors', 'shadow-lg');
    backButton.type = 'button';
    backButton.addEventListener('click', renderPreviousQuestion);
    
    // ปุ่ม "ถัดไป" หรือ "ดูผลลัพธ์" (ขวา)
    const isLastQuestion = index === BFI2XS_ITEMS.length - 1;
    const buttonText = isLastQuestion ? '👉 ดูผลลัพธ์ (Get Results)' : 'ถัดไป (Next) 👉';
    const nextButton = document.createElement('button');
    nextButton.textContent = buttonText;
    nextButton.classList.add('w-1/2', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'font-bold', 'py-3', 'px-4', 'rounded-lg', 'transition-colors', 'shadow-lg');
    nextButton.type = 'button'; 
    
    nextButton.addEventListener('click', function() {
        handleAnswerSubmission(item.id); // ไม่ต้องส่ง selectedValue เพราะบันทึกไว้ใน event listener แล้ว
    });
    
    // จัดการการแสดงปุ่มย้อนกลับ
    if (currentQuestionIndex > 0) {
        navButtonsContainer.appendChild(backButton);
        navButtonsContainer.appendChild(nextButton); 
    } else {
        // ถ้าเป็นข้อแรก ให้ปุ่มถัดไปอยู่ด้านขวาเต็ม
        navButtonsContainer.classList.remove('justify-between', 'space-x-4');
        navButtonsContainer.classList.add('justify-end');
        nextButton.classList.remove('w-1/2'); 
        nextButton.classList.add('w-full');
        navButtonsContainer.appendChild(nextButton);
    }
    
    itemContainer.appendChild(navButtonsContainer);
    
    quizCont.appendChild(itemContainer);
    
    // Add transition effect
    setTimeout(() => { itemContainer.style.opacity = 1; }, 10);
    
    updateProgressBar();
}

/**
 * จัดการเมื่อผู้ใช้ตอบคำถามและกดปุ่ม ถัดไป/ดูผลลัพธ์
 */
function handleAnswerSubmission(questionId) {
    const key = `q${questionId}`;
    
    // ตรวจสอบว่ามีการเลือกคำตอบหรือไม่ (ถ้ามีการเลือก จะถูกบันทึกใน userAnswers แล้ว)
    if (userAnswers[key] === undefined || userAnswers[key] === null) {
        alert("กรุณาเลือกคำตอบก่อนดำเนินการต่อ");
        return;
    }

    // 1. ไปยังคำถามถัดไป
    currentQuestionIndex++;
    
    renderQuiz();
}

/**
 * จัดการเมื่อผู้ใช้กดปุ่ม ย้อนกลับ
 */
function renderPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        // เนื่องจากคำตอบถูกบันทึกไว้ใน userAnswers ใน event listener แล้ว
        // การเรียก renderQuiz() จะดึงคำตอบเก่ามาแสดงผลโดยอัตโนมัติ
        renderQuiz(); 
    }
}


/**
 * อัปเดตแถบความคืบหน้า (Progress Bar)
 */
function updateProgressBar() {
    const totalQuestions = BFI2XS_ITEMS.length;
    // ใช้ Math.min(currentQuestionIndex, totalQuestions) เพื่อให้ค่าสูงสุดคือ 15
    const completedQuestions = Math.min(currentQuestionIndex, totalQuestions); 
    const progPercent = (completedQuestions / totalQuestions) * 100;
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progPercent}%`;
        progressBar.setAttribute('aria-valuenow', completedQuestions);
    }

    const progressText = document.getElementById('progress-text');
    if (progressText) {
        // แสดง "กำลังทำข้อที่ X / Y ข้อ"
        progressText.textContent = `กำลังทำข้อที่ ${Math.min(currentQuestionIndex + 1, totalQuestions)} / ${totalQuestions} ข้อ`;
    }
}

/**
 * จัดการการส่งแบบทดสอบและแสดงผลลัพธ์
 */
function submitQuiz() {
    // 1. คำนวณคะแนน Big Five
    const finalScores = calculateBigFiveScores();
    
    // 2. คำนวณผลการจับคู่สุนัข
    const dogMatchResult = matchUserToDogGroup(finalScores);

    // 3. แสดงหน้าผลลัพธ์
    renderResults(finalScores, dogMatchResult);
}

/**
 * แสดงหน้าผลลัพธ์ (ใน HTML)
 * @param {Object} scores - ผลรวมคะแนน Big Five
 * @param {Object} dogMatchResult - ผลการจับคู่สุนัข
 */
function renderResults(scores, dogMatchResult) {
    const quizCont = document.getElementById('quiz');
    quizCont.innerHTML = ''; // ล้างหน้า Quiz

    const dogMatchHTML = `
        <div class="dog-match-card p-5 rounded-lg bg-green-50 border-2 border-green-400 shadow-md">
            <p class="text-lg font-bold text-green-800 mb-2">กลุ่มสุนัขที่แนะนำ: ${dogMatchResult.groupName}</p>
            <div class="pb-3"><img id="dogPic" src="${dogMatchResult.dogPic}" alt=""></div>
            <p class="text-gray-700">${dogMatchResult.description}</p>
            <p class="mt-3 text-sm text-gray-500">
                <strong>สายพันธุ์ที่เข้ากัน:</strong> ${dogMatchResult.exampleBreeds.join(', ')}
            </p>
        </div>
    `;

    const resultHTML = `
        <div class="result-container bg-white p-6 md:p-10 rounded-xl shadow-2xl space-y-6 max-w-2xl mx-auto">
            <h2 class="text-3xl font-extrabold text-indigo-700 border-b-2 pb-2 mb-4">
                ✨ ผลการประเมินบุคลิกภาพ Big Five
            </h2>
            <p class="text-gray-600 mb-6">คะแนนรวมแต่ละมิติ (ช่วง 3 ถึง 15)</p>

            ${Object.entries(scores).map(([domain, score]) => {
                const interpretation = interpretScore(domain, score);
                const scorePercentage = ((score - 3) / 12) * 100;
                
                return `
                    <div class="domain-card p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                        <h3 class="text-xl font-bold text-indigo-800">${domain} - ${getDomainName(domain)}: ${score} / 15</h3>
                        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div class="bg-indigo-500 h-2.5 rounded-full" style="width: ${scorePercentage}%;"></div>
                        </div>
                        <p class="mt-2 text-gray-700"><strong>ระดับ:</strong> ${interpretation.level}</p>
                        <!--<p class="text-sm text-gray-500">${interpretation.description}</p>-->
                    </div>
                `;
            }).join('')}
            
            <hr class="my-6 border-indigo-200">

            <h2 class="text-3xl font-extrabold text-green-700 border-b-2 pb-2 mb-4">
                🐶 ผลการจับคู่สุนัขที่เข้ากัน
            </h2>
            ${dogMatchHTML}

        </div>
    `;
    quizCont.innerHTML = resultHTML;

    // ซ่อนแถบ Progress
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

/**
 * แปลงมิติย่อเป็นชื่อเต็มภาษาไทย/อังกฤษ
 * @param {string} domain - E, A, C, N, O
 * @returns {string} - ชื่อเต็ม
 */
function getDomainName(domain) {
    switch (domain) {
        case 'E': return 'Extraversion (การเปิดเผย)';
        case 'A': return 'Agreeableness (การยอมรับ)';
        case 'C': return 'Conscientiousness (ความรอบคอบ)';
        case 'N': return 'Negative Emotionality (ความไม่มั่นคงทางอารมณ์)';
        case 'O': return 'Open-Mindedness (การเปิดรับประสบการณ์)';
        default: return '';
    }
}

/**
 * แปลผลคะแนนตามช่วง (3-15)
 * @param {string} domain - มิติบุคลิกภาพ
 * @param {number} score - คะแนนรวม
 * @returns {Object} - การแปลผล
 */
function interpretScore(domain, score) {
    let level;
    let description;

    if (score >= 12) {
        level = 'สูง (Strongly Present)';
        description = 'แสดงลักษณะนิสัยในมิตินี้อย่างชัดเจนและเข้มข้น';
    } else if (score >= 7) {
        level = 'ปานกลาง (Moderately Present)';
        description = 'แสดงลักษณะนิสัยในมิตินี้ในระดับปานกลาง';
    } else { // 3-6
        level = 'ต่ำ (Weakly Present)';
        description = 'แสดงลักษณะนิสัยในมิตินี้ในระดับน้อยหรือต่ำ';
    }

    return { level, description };
}

// =========================================================================
// 3. INITIALIZATION
// =========================================================================

// เริ่มต้น Quiz เมื่อหน้าเว็บโหลดเสร็จ
window.onload = function() {
    renderQuiz();
};

function confirm(message) {
    // ใช้ console.log แทน window.confirm เพื่อหลีกเลี่ยงปัญหาใน iFrame
    console.log("Confirm attempt:", message);
    return true; 
}

function alert(message) {
    // ใช้ console.log แทน window.alert เพื่อหลีกเลี่ยงปัญหาใน iFrame
    console.log("Alert attempt:", message);
}
