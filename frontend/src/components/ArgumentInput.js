// components/ArgumentInput.js
import React, { useState, useEffect } from 'react';
import { SpeechRecognitionService } from '../utils/speechRecognition';

const ArgumentInput = ({ onSubmit }) => {
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
    e.preventDefault();
    if (argument.trim()) {
      onSubmit(argument);
      setArgument('');
      setInterimText('');
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
    <div className="argument-input">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            value={argument + (interimText ? ` ${interimText}` : '')}
            onChange={(e) => setArgument(e.target.value)}
            placeholder="Present your argument with evidence and reasoning..."
            rows="4"
            maxLength={1000}
            className={interimText ? 'with-interim' : ''}
          />
          
          {speechError && (
            <div className="speech-error">
              ⚠️ {speechError}
            </div>
          )}
          
          <div className="input-controls">
            <div className="voice-controls">
              {isSupported ? (
                <>
                  <button
                    type="button"
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!isSupported}
                  >
                    🎤 {isRecording ? 'Stop Recording' : 'Voice Input'}
                  </button>
                  <button
                    type="button"
                    onClick={clearText}
                    className="clear-btn"
                  >
                    🗑️ Clear
                  </button>
                </>
              ) : (
                <span className="no-support">🎤 Voice input not supported</span>
              )}
            </div>
            
            <div className="text-controls">
              <div className="character-count">
                {argument.length}/1000
              </div>
              <button 
                type="submit" 
                disabled={!argument.trim()}
                className="submit-btn"
              >
                Submit Argument
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArgumentInput;
