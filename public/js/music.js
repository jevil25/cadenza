$('.search-button').click(function(){
    $(this).parent().toggleClass('open');
  });

  let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
let length=document.getElementById(".length");

let track_index = 0;
let isPlaying = false;
let updateTimer;
let loaded=false;

// Create new audio element
let curr_track = document.createElement('audio');

function random_bg_color() {

  // Get a number between 64 to 200 (for getting lighter colors and not white)
  let red = Math.floor(Math.random() * 200);
  let green = Math.floor(Math.random() * 200);
  let blue = Math.floor(Math.random() * 200);

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + "," + green + "," + blue + ")";
  let bgColor1= "rgb(" + red+10 + "," + green+10 + "," + blue+10 + ")";

  // Set the background to that color
  document.body.style.background = bgColor;
  document.getElementsByClassName(".sidenav").style.background = bgColor;
}

function loadTrack(track1) {
  clearInterval(updateTimer);
  resetValues();
  curr_track.src = track1;
  curr_track.load();
  loaded=true;

  updateTimer = setInterval(seekUpdate, 1000);
  curr_track.addEventListener("ended", nextTrack);
}

function resetValues() {
  curr_time.innerHTML = "00:00";
  total_duration.innerHTML = "00:00";
  seek_slider.value = 0;
}

random_bg_color();

function playpauseTrack(track1) {
  if(!loaded){
    if (!isPlaying) playTrack(track1);
    else pauseTrack();
  }else{
    if (!isPlaying) {
      curr_track.play();
      isPlaying = true;
      playpause_btn.innerHTML = '<i class="fa fa-solid fa-pause fa-3x"></i>';
    }
    else pauseTrack();
  }
}

function playTrack(track) {
  loadTrack(track);
  console.log(track);
  curr_track.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-solid fa-pause fa-3x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-solid fa-play fa-3x"></i>';
}

function seekTo() {
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;
  
  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);

    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }
    curr_time.innerHTML = currentMinutes + ":" + currentSeconds;
    total_duration.innerHTML = durationMinutes + ":" + durationSeconds;
  }
}
