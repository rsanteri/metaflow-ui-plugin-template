const VERSION_INFO = {
  api: 1
}


const Listeners = [];
const EventListeners = [];
let initialised = false;
let onReadyFn = () => null

function messageHandler(event) {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'ReadyToRender': {
        if (!initialised) {
          onReadyFn();
          initialised = true;
        }
        return;
      }
      case 'DataUpdate': {
        for (const listener of Listeners) {
          listener(event.data)
        }
        return;
      }
      case 'EventUpdate': {
        for (const listener of EventListeners) {
          listener(event.data)
        }
        return;
      }
    }
  }
}

const Metaflow = {
  //
  // Update height of plugin to parent application. Useful if we want whole plugin to be visible
  //
  setHeight(fixedHeight) {
    if (fixedHeight) {
      window.parent.postMessage({ name: window.name, type: 'PluginHeightCheck', height: fixedHeight }, '*');
    } else {
      const body = document.body;
      const height = Math.max( body.scrollHeight, body.offsetHeight, body.clientHeight );
      window.parent.postMessage({ name: window.name, type: 'PluginHeightCheck', height: height }, '*');
    }
  },
  //
  // Register application
  //
  register(slot, onReady) {
    onReadyFn = onReady;
    window.parent.postMessage({ name: window.name, type: 'PluginRegisterEvent', slot: slot, version: VERSION_INFO }, '*')
    window.addEventListener('message', messageHandler);
  },
  //
  // Subscribe to data resources
  //
  subscribe(paths, fn) {
    Listeners.push(fn);
    window.parent.postMessage({ name: window.name, type: 'PluginSubscribeToData', paths: paths }, '*')
  },
  //
  // Subscribe to events
  //
  on(events, fn) {
    EventListeners.push(fn);
    window.parent.postMessage({ name: window.name, type: 'PluginSubscribeToEvent', events: events }, '*')
  },
  //
  // Call event
  //
  call(event, data) {
    window.parent.postMessage({ name: window.name, type: 'PluginCallEvent', event: event, data: data }, '*')
  },
  //
  // Send notification
  // @param {string | {type: string, message: string}} message
  //
  sendNotification(message) {
    window.parent.postMessage({ name: window.name, type: 'PluginCallEvent', event: 'SEND_NOTIFICATION', data: message }, '*')
  },
  //
  // Request to be removed?
  //
  remove(fn) {
    window.parent.postMessage({ name: window.name, type: 'PluginRemoveRequest' }, '*')
  },
}




window.Metaflow = Metaflow;

