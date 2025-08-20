document.addEventListener('DOMContentLoaded', () => {
    // --- 要素の取得 ---
    const htmlEditor = document.getElementById('html-editor');
    const cssEditor = document.getElementById('css-editor');
    const previewFrame = document.getElementById('preview-frame');
    const htmlLoadBtn = document.getElementById('html-load-btn');
    const htmlSaveBtn = document.getElementById('html-save-btn');
    const cssLoadBtn = document.getElementById('css-load-btn');
    const cssSaveBtn = document.getElementById('css-save-btn');
    const htmlColorPickerBtn = document.getElementById('html-color-picker-btn');
    const cssColorPickerBtn = document.getElementById('css-color-picker-btn');

    // --- 関数定義 ---
    function updatePreview() {
        const html = htmlEditor.value;
        const css = cssEditor.value;
        const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`);
        frameDoc.close();
    }

    function saveFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function loadFile(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.css,.txt';
        input.onchange = e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => callback(e.target.result);
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // カラーピッカーの初期化
    function initColorPicker(editor, pickerBtn, pickerContainerId) {
        const pickerContainer = document.getElementById(pickerContainerId);
        const colorInput = pickerContainer.querySelector('input[type="color"]');
        const hexInput = pickerContainer.querySelector('.hex-input');
        const preview = pickerContainer.querySelector('.color-preview');
        const applyBtn = pickerContainer.querySelector('.apply-button');
        const closeBtn = pickerContainer.querySelector('.close-button');
        const presets = pickerContainer.querySelectorAll('.color-preset');

        let selectionStart = 0;
        let selectionEnd = 0;

        pickerBtn.addEventListener('click', () => {
            selectionStart = editor.selectionStart;
            selectionEnd = editor.selectionEnd;
            pickerContainer.classList.toggle('visible');
        });

        closeBtn.addEventListener('click', () => pickerContainer.classList.remove('visible'));
        
        colorInput.addEventListener('input', () => {
            hexInput.value = colorInput.value;
            preview.style.backgroundColor = colorInput.value;
        });

        hexInput.addEventListener('input', () => {
            if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
                colorInput.value = hexInput.value;
                preview.style.backgroundColor = hexInput.value;
            }
        });

        presets.forEach(p => p.addEventListener('click', () => {
            const color = p.dataset.color;
            colorInput.value = color;
            hexInput.value = color;
            preview.style.backgroundColor = color;
        }));

        applyBtn.addEventListener('click', () => {
            const color = hexInput.value;
            const text = editor.value;
            const newText = text.substring(0, selectionStart) + color + text.substring(selectionEnd);
            editor.value = newText;
            updatePreview();
            pickerContainer.classList.remove('visible');
            editor.focus();
            editor.selectionStart = editor.selectionEnd = selectionStart + color.length;
        });
    }

    // --- イベントリスナーの設定 ---
    htmlEditor.addEventListener('input', updatePreview);
    cssEditor.addEventListener('input', updatePreview);

    htmlLoadBtn.addEventListener('click', () => loadFile(content => {
        htmlEditor.value = content;
        updatePreview();
    }));
    htmlSaveBtn.addEventListener('click', () => saveFile(htmlEditor.value, 'index.html'));

    cssLoadBtn.addEventListener('click', () => loadFile(content => {
        cssEditor.value = content;
        updatePreview();
    }));
    cssSaveBtn.addEventListener('click', () => saveFile(cssEditor.value, 'style.css'));

    // --- 初期化処理 ---
    initColorPicker(htmlEditor, htmlColorPickerBtn, 'html-color-picker');
    initColorPicker(cssEditor, cssColorPickerBtn, 'css-color-picker');
    updatePreview();
});