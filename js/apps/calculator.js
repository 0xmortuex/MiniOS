// Calculator Application
const CalculatorApp = {
  open() {
    const win = WindowManager.createWindow({
      title: 'Calculator',
      icon: AppIcons.get('calculator'),
      width: 300,
      height: 420,
      minWidth: 260,
      minHeight: 380,
      appId: 'calculator',
      resizable: false
    });

    let current = '0';
    let expression = '';
    let lastOp = '';
    let lastNum = '';
    let resetNext = false;
    let history = [];

    const body = win.getBody();
    body.innerHTML = `
      <div class="calculator">
        <div class="calc-history"></div>
        <div class="calc-display">
          <div class="calc-expression">&nbsp;</div>
          <div class="calc-result">0</div>
        </div>
        <div class="calc-buttons">
          <button class="calc-btn clear" data-action="clear">C</button>
          <button class="calc-btn clear" data-action="ce">CE</button>
          <button class="calc-btn operator" data-action="percent">%</button>
          <button class="calc-btn operator" data-action="divide">&divide;</button>
          <button class="calc-btn" data-action="7">7</button>
          <button class="calc-btn" data-action="8">8</button>
          <button class="calc-btn" data-action="9">9</button>
          <button class="calc-btn operator" data-action="multiply">&times;</button>
          <button class="calc-btn" data-action="4">4</button>
          <button class="calc-btn" data-action="5">5</button>
          <button class="calc-btn" data-action="6">6</button>
          <button class="calc-btn operator" data-action="subtract">&minus;</button>
          <button class="calc-btn" data-action="1">1</button>
          <button class="calc-btn" data-action="2">2</button>
          <button class="calc-btn" data-action="3">3</button>
          <button class="calc-btn operator" data-action="add">+</button>
          <button class="calc-btn" data-action="negate">&plusmn;</button>
          <button class="calc-btn" data-action="0">0</button>
          <button class="calc-btn" data-action="decimal">.</button>
          <button class="calc-btn equals" data-action="equals">=</button>
        </div>
      </div>
    `;

    const display = body.querySelector('.calc-result');
    const exprDisplay = body.querySelector('.calc-expression');
    const historyEl = body.querySelector('.calc-history');

    function updateDisplay() {
      display.textContent = current;
      exprDisplay.textContent = expression || '\u00a0';
    }

    function handleAction(action) {
      if (action >= '0' && action <= '9') {
        if (resetNext) { current = ''; resetNext = false; }
        if (current === '0' && action !== '0') current = action;
        else if (current === '0' && action === '0') {}
        else current += action;
      } else if (action === 'decimal') {
        if (resetNext) { current = '0'; resetNext = false; }
        if (!current.includes('.')) current += '.';
      } else if (action === 'negate') {
        if (current !== '0') {
          current = current.startsWith('-') ? current.slice(1) : '-' + current;
        }
      } else if (action === 'clear') {
        current = '0';
        expression = '';
        lastOp = '';
        lastNum = '';
        resetNext = false;
      } else if (action === 'ce') {
        current = '0';
      } else if (action === 'percent') {
        current = String(parseFloat(current) / 100);
      } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
        if (lastOp && !resetNext) {
          calculate();
        }
        const opSymbol = { add: '+', subtract: '−', multiply: '×', divide: '÷' }[action];
        expression = current + ' ' + opSymbol + ' ';
        lastOp = action;
        lastNum = current;
        resetNext = true;
      } else if (action === 'equals') {
        if (lastOp) {
          const expr = lastNum + ' ' + { add: '+', subtract: '−', multiply: '×', divide: '÷' }[lastOp] + ' ' + current;
          calculate();
          history.push(expr + ' = ' + current);
          historyEl.textContent = history.slice(-3).join(' | ');
          expression = '';
          lastOp = '';
          lastNum = '';
          resetNext = true;
        }
      }
      updateDisplay();
    }

    function calculate() {
      const a = parseFloat(lastNum);
      const b = parseFloat(current);
      let result;
      switch (lastOp) {
        case 'add': result = a + b; break;
        case 'subtract': result = a - b; break;
        case 'multiply': result = a * b; break;
        case 'divide': result = b === 0 ? 'Error' : a / b; break;
        default: return;
      }
      if (typeof result === 'number') {
        // Avoid floating point display issues
        current = String(Math.round(result * 1e10) / 1e10);
      } else {
        current = result;
      }
    }

    // Button clicks
    body.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAction(btn.dataset.action));
    });

    // Keyboard input
    body.addEventListener('keydown', (e) => {
      e.stopPropagation();
      const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '.': 'decimal', '+': 'add', '-': 'subtract',
        '*': 'multiply', '/': 'divide',
        'Enter': 'equals', '=': 'equals',
        'Escape': 'clear', 'Backspace': 'ce',
        '%': 'percent'
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        handleAction(keyMap[e.key]);
      }
    });

    // Make body focusable for keyboard
    body.tabIndex = 0;
    body.focus();
  }
};
