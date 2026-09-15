// components/ArgumentInput.js
import React, { useState, useEffect } from 'react';
import { SpeechRecognitionService } from '../utils/speechRecognition';

const ArgumentInput = ({ onSubmit, debateActive }) => {
  const [argument, setArgument] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechService] = useState(new SpeechRecognitionService());
  const [interimText, setInterimText] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(speechService.isRecognitionSupported());
  }, [speechService]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (argument.trim()) {
      onSubmit(argument);
      setArgument('');
      setInterimText('');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startRecording = async () => {
    setSpeechError('');
    setIsRecording(true);
    
    speechService.startListening(
      (finalText, interim) => {
        setArgument(prev => prev + finalText);
        setInterimText(interim);
      },
      (finalText) => {
        setIsRecording(false);
        setInterimText('');
        if (finalText) {
          setArgument(prev => prev + (prev ? ' ' : '') + finalText);
        }
      },
      (error) => {
        setIsRecording(false);
        setInterimText('');
        setSpeechError(error);
      }
    );
  };

  const stopRecording = () => {
    speechService.stopListening();
    setIsRecording(false);
    setInterimText('');
  };

  const clearText = () => {
    setArgument('');
    setInterimText('');
    setSpeechError('');
  };

  return (
    <div className="argument-input-card">
      <form onSubmit={handleSubmit}>
        <div className="input-container-box">
          <div className="input-header-bar">
            <span className="input-title">✍️ Craft Argument</span>
            <span className="shortcut-hint">Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send</span>
          </div>

          <textarea
            value={argument + (interimText ? ` ${interimText}` : '')}
            onChange={(e) => setArgument(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Structure your position clearly with reasoning, facts, and supporting data for highest AI evaluation..."
            rows="3"
            maxLength={1000}
            className={`custom-textarea ${interimText ? 'with-interim' : ''}`}
          />
          
          {speechError && (
            <div className="speech-error-banner">
              ⚠️ {speechError}
            </div>
          )}
          
          <div className="input-controls-row">
            <div className="voice-controls-group">
              {isSupported ? (
                <>
                  <button
                    type="button"
                    className={`voice-record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!isSupported}
                  >
                    {isRecording ? (
                      <>
                        <span className="recording-wave"></span>
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <span>🎤 Voice Input</span>
                      </>
                    )}
                  </button>
                  
                  {argument.length > 0 && (
                    <button
                      type="button"
                      onClick={clearText}
                      className="clear-btn"
                    >
                      Clear
                    </button>
                  )}
                </>
              ) : (
                <span className="no-support">🎤 Voice recognition unavailable</span>
              )}
            </div>
            
            <div className="submit-controls-group">
              <div className="char-counter">
                <span className={argument.length > 900 ? 'near-limit' : ''}>
                  {argument.length}
                </span>/1000
              </div>

              <button 
                type="submit" 
                disabled={!argument.trim()}
                className="submit-argument-btn"
              >
                <span>Submit to Floor</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArgumentInput;
