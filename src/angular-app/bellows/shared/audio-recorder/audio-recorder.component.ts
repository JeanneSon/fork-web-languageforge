import * as angular from 'angular';

declare var MediaRecorder: any;

export class AudioRecorderController implements angular.IController {

  static $inject = ['$interval', '$scope'];

  mediaRecorder:any;
  chunks: any = [];
  isRecording = false;
  hasRecorded = false;
  audioSrc: string;
  blob: Blob;
  recordingTime: string;
  errorMessage: string;
  callback: (blob: Blob) => void;
  interval: angular.IPromise<void>;

  constructor(private $interval: angular.IIntervalService, private $scope: angular.IScope) {}

//METHODS//

  private startRecording() {

    this.recordingTime = '0:00';

    //getUserMedia
    navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => {

      console.log(stream);

      this.mediaRecorder = new MediaRecorder(stream);

      this.hasRecorded = true;
      this.errorMessage = null;
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (e: any) => {

        this.chunks.push(e.data);
      };

      const recordingStartTime = new Date();

      this.mediaRecorder.onstop = () => {
        console.log('data available after MediaRecorder.stop() called.');

        this.blob = new Blob(this.chunks, {type: 'audio/webm'});
        this.chunks = [];
        this.audioSrc = window.URL.createObjectURL(this.blob);

        console.log(this.audioSrc);
        console.log('recorder stopped');
      };

      this.interval = this.$interval(() => {
        const seconds = Math.floor((new Date().getTime() - recordingStartTime.getTime()) / 1000);
        this.recordingTime = Math.floor(seconds / 60) + ':' + (seconds % 60 < 10 ? '0' : '') + seconds % 60;
      }, 1000);


      this.mediaRecorder.start();
      console.log(this.mediaRecorder.state); //"recording"
      console.log("recorder started");


    }, err => {

      this.errorMessage = 'Unable to record audio from your microphone.';
      this.isRecording = false;
      this.hasRecorded = false;

      console.error(err);

      });//END getUserMedia call


  }

  private stopRecording() {

    this.mediaRecorder.stop();

    console.log(this.mediaRecorder.state); //"recording"
    if (this.interval) this.$interval.cancel(this.interval);

  }

  toggleRecording() {
    if (this.isRecording) this.stopRecording();
    else this.startRecording();
    this.isRecording = !this.isRecording;
    console.log("Now recording: " + this.isRecording); //true or false
  }

  close() {
    this.stopRecording();
    this.callback(null);
  }

  saveAudio() {
    this.callback(this.blob);
  }

  recordingSupported() {
    return navigator.mediaDevices && navigator.mediaDevices.enumerateDevices && navigator.mediaDevices.getUserMedia &&
      ((window as any).AudioContext || (window as any).webkitAudioContext);
  }

  $onDestroy() {
    this.stopRecording();
  }

}


//EXPORT THE COMPONENT //
export const AudioRecorderComponent: angular.IComponentOptions = {
  bindings: {
    callback: '<' // TODO probably change to > or <, not sure which
  },
  controller: AudioRecorderController,
  templateUrl: '/angular-app/bellows/shared/audio-recorder/audio-recorder.component.html'
};
