// Variable global para controlar qué audio se está reproduciendo
let currentlyPlaying = null;

// Función para formatear el tiempo en formato MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Función para actualizar la barra de progreso y el tiempo
function updateProgress(audioId) {
  const audio = document.getElementById(audioId);
  const progressBar = document.getElementById('progress-' + audioId);
  const timeDisplay = document.getElementById('time-' + audioId);
  
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = progress + '%';
    
    const current = formatTime(audio.currentTime);
    const total = formatTime(audio.duration);
    timeDisplay.textContent = `${current} / ${total}`;
  }
}

// Función para configurar todos los eventos de un elemento audio
function setupAudioEvents(audioId) {
  const audio = document.getElementById(audioId);
  const button = document.getElementById('btn-' + audioId);
  const volumeSlider = document.getElementById('volume-' + audioId);
  const errorDiv = document.getElementById('error-' + audioId);
  
  // Configurar volumen inicial
  audio.volume = volumeSlider.value;
  
  // Control de volumen
  volumeSlider.addEventListener('input', function() {
    audio.volume = this.value;
  });

  // Evento cuando empieza a cargar
  audio.addEventListener('loadstart', function() {
    button.classList.add('loading');
    errorDiv.textContent = '';
  });

  // Evento cuando está listo para reproducir
  audio.addEventListener('canplay', function() {
    button.classList.remove('loading');
  });

  // Evento durante la reproducción (actualizar progreso)
  audio.addEventListener('timeupdate', function() {
    updateProgress(audioId);
  });

  // Evento cuando termina la canción
  audio.addEventListener('ended', function() {
    resetButton(audioId);
    currentlyPlaying = null;
  });

  // Evento de error
  audio.addEventListener('error', function(e) {
    button.classList.remove('loading');
    console.error('Error de audio:', e);
    errorDiv.textContent = 'Error al cargar el audio. Verifica la conexión o la URL.';
    resetButton(audioId);
    if (currentlyPlaying === audioId) {
      currentlyPlaying = null;
    }
  });

  // Evento cuando se pausa
  audio.addEventListener('pause', function() {
    resetButton(audioId);
  });

  // Evento cuando se reproduce
  audio.addEventListener('play', function() {
    button.classList.add('playing');
    button.innerHTML = '<span class="play-icon">⏸</span> Pausar';
  });

  // Click en la barra de progreso para saltar a una posición
  const progressContainer = document.querySelector(`#progress-${audioId}`).parentElement;
  progressContainer.addEventListener('click', function(e) {
    if (audio.duration) {
      const rect = this.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percent * audio.duration;
    }
  });
}

// Función para resetear el botón a su estado inicial
function resetButton(audioId) {
  const button = document.getElementById('btn-' + audioId);
  button.classList.remove('playing');
  button.innerHTML = '<span class="play-icon">▶</span> Reproducir';
}

// Función principal para reproducir/pausar audio
function toggleAudio(audioId, url) {
  const audio = document.getElementById(audioId);
  
  // Si hay otro audio reproduciéndose, detenerlo
  if (currentlyPlaying && currentlyPlaying !== audioId) {
    const currentAudio = document.getElementById(currentlyPlaying);
    currentAudio.pause();
    resetButton(currentlyPlaying);
  }

  // Si el audio actual está reproduciéndose, pausarlo
  if (currentlyPlaying === audioId && !audio.paused) {
    audio.pause();
    currentlyPlaying = null;
    return;
  }

  // Configurar la fuente si no está configurada
  if (!audio.src) {
    audio.src = url;
  }

  // Reproducir el audio
  audio.play()
    .then(() => {
      currentlyPlaying = audioId;
    })
    .catch(error => {
      console.error('Error al reproducir:', error);
      const errorDiv = document.getElementById('error-' + audioId);
      errorDiv.textContent = 'Error al reproducir el audio. Intenta de nuevo.';
      resetButton(audioId);
    });
}

// Función para parar todos los audios
function stopAllAudios() {
  ['audio1', 'audio2', 'audio3'].forEach(audioId => {
    const audio = document.getElementById(audioId);
    if (!audio.paused) {
      audio.pause();
      resetButton(audioId);
    }
  });
  currentlyPlaying = null;
}

// Función para controlar el volumen de todos los audios
function setGlobalVolume(volume) {
  ['audio1', 'audio2', 'audio3'].forEach(audioId => {
    const audio = document.getElementById(audioId);
    const volumeSlider = document.getElementById('volume-' + audioId);
    audio.volume = volume;
    volumeSlider.value = volume;
  });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  // Configurar eventos para todos los audios
  ['audio1', 'audio2', 'audio3'].forEach(audioId => {
    setupAudioEvents(audioId);
  });
  
  // Agregar atajos de teclado opcionales
  document.addEventListener('keydown', function(e) {
    // Espaciadora para pausar/reproducir
    if (e.code === 'Space' && currentlyPlaying) {
      e.preventDefault();
      const audio = document.getElementById(currentlyPlaying);
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
    
    // Escape para detener todo
    if (e.code === 'Escape') {
      stopAllAudios();
    }
  });
  
  console.log('Reproductor de música cargado correctamente');
});