const VERSION_INFO = {
  api: '0.13.0'
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
  /**
   *  Update height of plugin to parent application. Useful if we want whole plugin to be visible
   * @param {number} fixedHeight Optional fixed height in pixels for plugin. If not given, we try to calculate plugin height automatically.
   */
  setHeight(fixedHeight) {
    if (fixedHeight) {
      window.parent.postMessage({ name: window.name, type: 'PluginHeightCheck', height: fixedHeight }, '*');
    } else {
      const body = document.body;
      const height = Math.max( body.scrollHeight, body.offsetHeight, body.clientHeight );
      window.parent.postMessage({ name: window.name, type: 'PluginHeightCheck', height: height }, '*');
    }
  },
  /**
   * Register application to be rendered in app.
   * @param {("headless"|"run-header"|"task-details")} slot 
   * @param {(manifest: PluginManifest) => void} onReady 
   */
  register(slot, onReady) {
    onReadyFn = onReady;
    window.parent.postMessage({ name: window.name, type: 'PluginRegisterEvent', slot: slot, version: VERSION_INFO }, '*')
    window.addEventListener('message', messageHandler);
  },
  /**
   * Subscribe to data 
   * @param {string[]} paths 
   * @param {(event: { path: string, data: * }) => void} fn 
   */
  subscribe(paths, fn) {
    Listeners.push(fn);
    window.parent.postMessage({ name: window.name, type: 'PluginSubscribeToData', paths: paths }, '*')
  },
  /**
   * Subsribe to events 
   * @param {string[]} events List of event name to subscribe to
   * @param {(event: { type: string, data: * }) => void} fn Callback to trigger in case of event
   */
  on(events, fn) {
    EventListeners.push(fn);
    window.parent.postMessage({ name: window.name, type: 'PluginSubscribeToEvent', events: events }, '*')
  },
  /**
   * Call event with any name and payload. Other plugins or systems in app might subscribe to these events.
   * @param {string} event
   * @param {*} data 
   */
  call(event, data) {
    window.parent.postMessage({ name: window.name, type: 'PluginCallEvent', event: event, data: data }, '*')
  },
  /**
   * Send notification on main application
   * @param {string | {type: string, message: string}} message 
   */
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

