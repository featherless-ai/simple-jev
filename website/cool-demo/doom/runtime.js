/* Minimal browser shell for pavy23/web-doom's direct LinuxDOOM build. */
window.doomReady = new Promise((resolve, reject) => {
  window.Module = {
    canvas: document.getElementById('canvas'),
    locateFile: path => `vendor/${path}`,
    noInitialRun: true,
    onRuntimeInitialized: resolve,
    onAbort: reason => reject(new Error(String(reason))),
    print: text => console.log(text),
    printErr: text => console.error(text),
  };
});
window.DoomControl = {
  getState() { return JSON.parse(Module.ccall('doomctl_get_state_json', 'string', [], [])); },
  getSectors(limit = 256) { return JSON.parse(Module.ccall('doomctl_get_sectors_json', 'string', ['number'], [limit])); },
};
