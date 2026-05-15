class AudioGuidanceManager {
  private currentAudio: HTMLAudioElement | null = null;

  public play(promptName: string, languageCode: string = 'en') {
    if (typeof window === 'undefined') return;
    
    // Stop any currently playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    try {
      const audioPath = `/audio/${languageCode}/${promptName}.mp3`;
      this.currentAudio = new Audio(audioPath);
      this.currentAudio.play().catch(e => {
        console.warn(`Failed to play audio prompt ${promptName}:`, e);
      });
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
  }
}

export const audioGuidance = new AudioGuidanceManager();
