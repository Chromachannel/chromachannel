// /JavaScript/voice-module.js 【最終確定版】

class SiteWideSpeaker {
    constructor(controlPanelId, stopButtonId) {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.isLoading = true;
        this.currentUtterance = null;
        this.currentHighlightElement = null;

        // コントロールパネルの要素を取得
        this.controlPanel = document.getElementById(controlPanelId);
        this.stopButton = document.getElementById(stopButtonId);

        this.loadVoices();
        this.bindEvents();
    }

    loadVoices() {
        if (!('speechSynthesis' in window)) {
            console.warn('このブラウザは音声合成に対応していません。');
            this.isLoading = false;
            return;
        }
        const setVoices = () => {
            this.voices = this.synth.getVoices().filter(v => v.lang === 'ja-JP');
            this.isLoading = false;
        };
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = setVoices;
        }
        setVoices();
    }
    
    bindEvents() {
        if(this.stopButton){
            this.stopButton.addEventListener('click', () => this.stop());
        }
    }

    // =======================================================
    // ★★ エラーの原因は、この stop() 関数がなかったことです ★★
    // =======================================================
    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
    }

    showControls() {
        if(this.controlPanel) {
            this.controlPanel.classList.remove('hidden');
            this.controlPanel.classList.add('visible');
        }
    }
    
    hideControls() {
        if(this.controlPanel) {
            this.controlPanel.classList.remove('visible');
            this.controlPanel.classList.add('hidden');
        }
    }

    speak(text, highlightElement, onEndCallback = null) {
        if (this.isLoading) return;
        
        if (this.synth.speaking) {
            this.synth.cancel(); 
        }

        if (this.currentHighlightElement) {
            this.currentHighlightElement.style.backgroundPosition = '0 100%';
        }
        
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        const preferredVoice = this.voices.find(v => v.name === 'Google 日本語') || 
                             this.voices.find(v => v.name.includes('Microsoft Ayumi')) ||
                             this.voices.find(v => v.name === 'Kyoko');
        
        this.currentUtterance.voice = preferredVoice || this.voices[0];
        this.currentUtterance.lang = 'ja-JP';
        this.currentUtterance.rate = 1.0;
        this.currentUtterance.pitch = 1.1;

        this.currentHighlightElement = highlightElement;

        this.currentUtterance.onstart = () => {
            this.showControls();
            if (this.currentHighlightElement) {
                this.currentHighlightElement.style.backgroundPosition = '0 0';
            }
        };

        this.currentUtterance.onend = () => {
            this.hideControls();
            if (this.currentHighlightElement) {
                this.currentHighlightElement.style.backgroundPosition = '0 100%';
            }
            this.currentUtterance = null;
            this.currentHighlightElement = null;
            
            if (onEndCallback) {
                onEndCallback();
            }
        };
        
        this.currentUtterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            this.hideControls();
             if (this.currentHighlightElement) {
                this.currentHighlightElement.style.backgroundPosition = '0 100%';
            }
            if (onEndCallback) {
                onEndCallback();
            }
        };

        this.synth.speak(this.currentUtterance);
    }
}

// グローバルインスタンスを作成し、コントロールパネルのIDを渡す
window.siteSpeaker = new SiteWideSpeaker('global-speech-control', 'global-speech-stop-btn');