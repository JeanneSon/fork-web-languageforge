import * as angular from 'angular';

export class AudioRecorderController implements angular.IController {

  constructor(){}

  microphoneButton = document.getElementById("microphone-button");

  clickMicrophone() {
      console.log("microphone clicked");
      navigator.mediaDevices.getUserMedia({
        audio: true
      }).then(function onSuccess(stream) {
        var recordingContainerElement = document.createElement("div");
        var recordElement = document.createElement("button");
        recordElement.innerHTML = "Record";
        var stopElement = document.createElement("button");
        stopElement.innerHTML = "Stop";
        var recordingsElement = document.createElement('article');
        recordingContainerElement.appendChild(recordElement);
        recordingContainerElement.appendChild(stopElement);
        var mediaRecorder = new MediaRecorder(stream);
        var chunks: BlobPart[] = [];

        recordElement.addEventListener('click', function onClickRecord() {
          mediaRecorder.start();
        });

        stopElement.addEventListener('click', function onClickStop() {
          mediaRecorder.stop();
        });

        mediaRecorder.addEventListener('stop', function onStop() {
          var clipContainerElement = document.createElement('article');
          var clipLabelElement = document.createElement('p');
          var audioElement = document.createElement('audio');
          audioElement.setAttribute('controls', '');
          clipContainerElement.appendChild(audioElement);
          clipContainerElement.appendChild(clipLabelElement);
          recordingsElement.appendChild(clipContainerElement);
          audioElement.controls = true;
          var blob = new Blob(chunks, { type : 'audio/ogg; codecs=opus' });
          chunks = [];
          audioElement.src = window.URL.createObjectURL(blob);
        });

        mediaRecorder.addEventListener('dataavailable', function onDataAvailable(event) {
          chunks.push(event.data);
        });

      }).catch(function onError(err) {
        console.log('The following error occured:', err);
      });
}


}

export const AudioRecorderComponent: angular.IComponentOptions = {
  bindings: {
    callback: '<' // TODO probably change to > or <, not sure which
  },
  controller: AudioRecorderController,
  templateUrl: '/angular-app/bellows/shared/audio-recorder/audio-recorder.component.html'
};
