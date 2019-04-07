"use strict"

class GestureHandling {
  constructor(options) {
    this.id = `mbgl-gesture-handling-help-container-${GestureHandling.count}`;
    GestureHandling.count++;
    this.timer = null;

    this.settings = {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#ffffff',
      textMessage: 'Use alt + scroll to zoom the map.',
      textMessageMobile: 'Use two fingers to move the map.',
      timeout: 3000,
      ...options
    };

    this.helpElement = document.querySelector(`#${this.id}`);

    if (null === this.helpElement) {
      this.helpElement = document.createElement('div');
      this.helpElement.id = this.id;
      this.helpElement.style.backgroundColor = this.settings.backgroundColor;
      this.helpElement.style.position = 'absolute';
      this.helpElement.style.display = 'none';
      this.helpElement.style.zIndex = 9999;
      this.helpElement.style.justifyContent = 'center';
      this.helpElement.style.alignItems = 'center';

      const textBox = document.createElement('div');
      textBox.style.textAlign = 'center';
      textBox.style.color = this.settings.textColor;
      textBox.innerText = "";

      this.helpElement.appendChild(textBox);
      document.body.appendChild(this.helpElement);
    }
  }

  showHelp(map, message) {
    const rect = map.getContainer().getBoundingClientRect();
    this.helpElement.style.top = `${rect.top + window.scrollY}px`;
    this.helpElement.style.left = `${rect.left + window.scrollX}px`;
    this.helpElement.style.width = `${rect.width}px`;
    this.helpElement.style.height = `${rect.height}px`;
    this.helpElement.style.display = 'flex';

    this.helpElement.querySelector('div').innerText = message;
  }

  hideHelp() {
    this.helpElement.style.display = 'none';
  }

  addTo(map) {
    this.helpElement.addEventListener('wheel', (event) => {
      if (event.altKey) {
        this.hideHelp();
      } else {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.hideHelp();
        }, this.settings.timeout);
      }
    });

    map.on('zoomstart', (event) => {
      if ( event.originalEvent && 'wheel' === event.originalEvent.type && ! event.originalEvent.altKey) {
        this.showHelp(map, this.settings.textMessage);
        this.timer = setTimeout(() => {
          this.hideHelp();
        }, this.settings.timeout);
      }
    });

    this.helpElement.addEventListener('touchstart', (event) => {
      if (event.touches && 2 <= event.touches.length) {
        clearTimeout(this.timer);
        this.hideHelp();
        map.dragPan.enable();
        event.preventDefault();
      }
    });

    map.on('movestart', (event) => {
      if (event.originalEvent && 'touches' in event.originalEvent && 2 > event.originalEvent.touches.length) {
        this.showHelp(map, this.settings.textMessageMobile);
        map.dragPan.disable();
        this.timer = setTimeout(() => {
          map.dragPan.enable();
          this.hideHelp();
        }, this.settings.timeout);
      }
    });
  }
}

GestureHandling.count = 0 // static

export default GestureHandling;
