const io = require('socket.io-client');
const ask = require('./ask');

const address = 'http://localhost:9981';
const socket = io(address, {
  reconnectionAttempts: 5,
  timeout: 1000 * 10,
});

function exit() {
  socket.disconnect();
  process.exit();
}

async function askForMessageId() {
  const messageId = await ask('Please input a message id: ');

  if (messageId === '') {
    exit();
  }

  console.log(`\tSend '${messageId}' message to Connect`);
  socket.emit('ppMessage', { messageId });

  await askForMessageId();
}

process.on('SIGINT', function () {
  exit();
});

socket
  .on('connect_error', (err) => {
    console.error('[SOCKETIO] disconnected, error', err.toString());
  })
  .on('connect_timeout', () => {
    console.error('[SOCKETIO] disconnected by timeout');
  })
  .on('reconnect_failed', () => {
    console.error('[SOCKETIO] disconnected by retry_timeout');
  })
  .on('reconnect_attempt', (count) => {
    console.error(
      `[SOCKETIO] Retry to connect #${count}, Please make sure ProtoPie Connect is running on ${address}`
    );
  })
  .on('connect', async () => {
    console.log('[SOCKETIO] connected to', address);
    await askForMessageId();
  });

socket.on('disconnect', () => {
  console.log('[SOCKETIO] disconnected');
});

socket.on('ppMessage', (data) => {
  console.log('[SOCKETIO] Receive a message from Connect', data);
});
