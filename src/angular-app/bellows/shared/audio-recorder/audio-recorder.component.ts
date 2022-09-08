import * as angular from 'angular';
import {ChangeDetectorRef} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

declare var MediaRecorder: any;

export class AudioRecorderController implements angular.IController {

  static $inject = ['$interval', '$scope'];

  mediaRecorder:any;
  chunks: any = [];
	audioFiles: any = [];
  constructor(private $interval: angular.IIntervalService, private $scope: angular.IScope, private cd: ChangeDetectorRef, private dom: DomSanitizer) {}

  isRecording = false;
  hasRecorded = false;

  audioSrc: string;
  blob: Blob;
  recordingTime: string;

  errorMessage: string;

  callback: (blob: Blob) => void;

  interval: angular.IPromise<void>;


  toggleRecording() {
    if (this.isRecording) this.stopRecording();
    else this.startRecording();
    this.isRecording = !this.isRecording;
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

  private startRecording() {
    this.recordingTime = '0:00';

    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {

      this.$scope.$apply(() => {
        this.hasRecorded = true;
        this.errorMessage = null;
        this.isRecording = true;
      });

      const recordingStartTime = new Date();

      this.mediaRecorder = new MediaRecorder(stream);


      //What to do in the future once the audio has been recorded
      this.mediaRecorder.ondataavailable = (e: any) => {
        this.chunks.push(e.data);
      };


      //What to do in the future when this.mediaRecorder.stop() is called
      this.mediaRecorder.onstop = () => {
        console.log('data available after MediaRecorder.stop() called.');

        this.blob = new Blob(this.chunks, {type: 'audio/mp3'});
        this.chunks = [];
        this.audioSrc = window.URL.createObjectURL(this.blob);
        // audio.src = audioURL;
        this.audioFiles.push(this.audioSrc);
        console.log(this.audioSrc);
        console.log('recorder stopped');

      };

      this.mediaRecorder.start();
      console.log(this.mediaRecorder.state); //"recording"
      console.log("recorder started");

      this.interval = this.$interval(() => {
        const seconds = Math.floor((new Date().getTime() - recordingStartTime.getTime()) / 1000);
        this.recordingTime = Math.floor(seconds / 60) + ':' + (seconds % 60 < 10 ? '0' : '') + seconds % 60;
      }, 1000);

    }, err => {

      this.$scope.$apply(() => {
        this.errorMessage = 'Unable to record audio from your microphone.';
        this.isRecording = false;
        this.hasRecorded = false;
      });
      console.error(err);

      });
  }


  private stopRecording() {

    this.mediaRecorder.stop();
    console.log(this.mediaRecorder.state); //"recording"
    if (this.interval) this.$interval.cancel(this.interval);


  }

}

export const AudioRecorderComponent: angular.IComponentOptions = {
  bindings: {
    callback: '<' // TODO probably change to > or <, not sure which
  },
  controller: AudioRecorderController,
  templateUrl: '/angular-app/bellows/shared/audio-recorder/audio-recorder.component.html'
};
