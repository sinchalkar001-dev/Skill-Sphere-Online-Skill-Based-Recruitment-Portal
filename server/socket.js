// Simple socket helper to avoid circular requires
let io = null;

function setIO(i) { io = i; }
function getIO() { return io; }

module.exports = { setIO, getIO };
