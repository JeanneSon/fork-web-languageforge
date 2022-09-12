import * as angular from 'angular';
import { timeStamp } from 'console';
import { isThisISOWeek } from 'date-fns';

export class SoundController implements angular.IController {
  puiUrl: string;

  audioElement = document.createElement('audio');

  playing = false;

  private isUserMovingSlider: boolean = false;
  private slider: HTMLInputElement;

  static $inject = ['$scope', '$element'];
  constructor(private $scope: angular.IScope, private $element: angular.IRootElementService) { }

  $onInit(): void {
    this.slider = this.$element.find('.seek-slider').get(0) as HTMLInputElement;

    this.audioElement.addEventListener('ended', () => {
      this.$scope.$apply(() => {
        if (this.playing) {
          this.togglePlayback();
        }

        this.audioElement.currentTime = 0;
      });
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      console.log("audio metadata loaded; audio duration: " + this.duration());
      this.$scope.$digest();
    });

    const previousFormattedTime: string = null;
    this.audioElement.addEventListener('timeupdate', () => {
      if (!this.isUserMovingSlider) {
        this.slider.value = '' + this.audioElement.currentTime;
      }

      // If the time as shown the user has changed, only then run a digest
      if (previousFormattedTime !== this.currentTime()) {
        this.$scope.$digest();
      }
    });

    this.slider.addEventListener('change', (event: Event) => {
      const slider = event.target as HTMLInputElement;
      this.audioElement.currentTime = +slider.value;
      this.isUserMovingSlider = false;
    });

    this.slider.addEventListener('input', () => {
      this.isUserMovingSlider = true;
    });

  }

  $onChanges(changes: angular.IOnChangesObject): void {
    const urlChange = changes.puiUrl as angular.IChangesObject<string>;
    if (urlChange != null && urlChange.currentValue) {
      if (this.playing) {
        this.togglePlayback();
      }

      this.audioElement.src = urlChange.currentValue;
      console.log("audioElement src: " + this.audioElement.src);
    }
  }

  $onDestroy(): void {
    if (!this.audioElement.paused){
      this.audioElement.pause();
    }
  }

  iconClass(): string {
    return this.playing ? 'fa-pause' : 'fa-play';
  }


  async playAudio() {
    try{
      await new Promise (r => setTimeout(r, 900)); //to load in the audio
      return this.audioElement.play();
    } catch (e) {

    }
  }

  togglePlayback(): void {
    this.playing = !this.playing;
    console.log("Sound-player this.playing: " + this.playing);

    if (this.playing) {
      this.playAudio();
    } else {
      if(!this.audioElement.paused){
        this.audioElement.pause();
      }
    }

    // if (this.playing) {
    //   try{
    //     var playPromise = this.audioElement.play();
    //   }
    //   catch(e){

    //       console.log("Caught error while creating playPromise: " + e.message);
    //   }


    //   if (playPromise !== undefined && this.audioElement.HAVE_ENOUGH_DATA) {
    //     playPromise.then(_ => {
    //       // Automatic playback started!
    //       // Show playing UI.
    //       this.audioElement.pause();
    //     })
    //     .catch(error => {
    //       // Auto-play was prevented
    //       // Show paused UI.
    //       console.log("Caught error while trying to play and pause: " + error.message);
    //     });
    //   }
    // } else {
    //   this.audioElement.pause();
    // }
  }

  currentTimeInSeconds(): number {
    return this.audioElement.currentTime;
  }

  durationInSeconds(): number {
    if(this.audioElement.duration !== NaN){
      return this.audioElement.duration;
    }
    else {
      return 0;
    }

  }

  duration(): string {
    if(this.audioElement.duration !== NaN){
      return SoundController.formatTimestamp(this.audioElement.duration * 1000);
    }
    else{
      return "Loading";
    }

  }

  currentTime(): string {
    return SoundController.formatTimestamp(this.audioElement.currentTime * 1000);
  }

  private static formatTimestamp(timestamp: number): string {
    const totalSeconds = timestamp / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const secondsStr = (seconds < 10 ? '0' : '') + seconds;
    return minutes + ':' + secondsStr;
  }
}

export const SoundComponent: angular.IComponentOptions = {
  bindings: {
    puiUrl: '<'
  },
  controller: SoundController,
  templateUrl: '/angular-app/bellows/shared/sound-player.component.html'
};
