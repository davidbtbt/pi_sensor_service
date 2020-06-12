const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
app.use(bodyParser.raw());

// DHT RPIO sensor setup
const rpiDhtSensor = require('rpi-dht-sensor');
const rpio = require('rpio');
const dht_sensor_pin = 2;
const humidifier_pin_left = 5;
const humidifier_pin_right = 7;
const dht = new rpiDhtSensor.DHT22(2);
rpio.open(humidifier_pin_left, rpio.OUTPUT, rpio.HIGH);
rpio.open(humidifier_pin_right, rpio.OUTPUT, rpio.HIGH);

let humidifier_state = 'OFF';
let mq7_value = 0;

// Arduino serial read config
const SerialPort = require('serialport');
const serialParsers = SerialPort.parsers;
// Use a `\r\n` as a line terminator
const serialParser = new serialParsers.Readline({ delimiter: '\r\n' });
const serialPort = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 });
serialPort.pipe(serialParser);

server.listen(8080, () => console.log('Iot BT server listening on port 8080!'));

app.get('/', (req, res) => res.send('Bedroom dehumidifier and Sensors.'));

app.get('/sensors/mq7', (req, res) => {
  res.send(mq7_value.toString());
});

app.get('/plots/mq7', (req, res) => {
  res.sendfile(__dirname + '/index.html');
});

app.get('/sensors/temperature', (req, res) => {
  const readout = dht.read();
  const raw_temp = readout.temperature.toFixed(1);
  const temperature = (raw_temp * 9) / 5 + 32;
  //console.log("Temperature " + temperature.toFixed(1));
  res.send(temperature.toFixed(1).toString());
});

app.get('/sensors/humidity', (req, res) => {
  const readout = dht.read();
  const humidity = readout.humidity.toFixed(1);
  //console.log("Humidity " + humidity);
  res.send(humidity);
});

app.get('/switches/humidifier', (req, res) => {
  res.send(humidifier_state);
});

app.post('/switches/humidifier', (req, res) => {
  //set gpio on
  const param_state = req.body.toString().trim();
  console.log('set humidifier ' + param_state);
  if (param_state === 'ON') {
    //console.log("humidifier " + param_state)
    humidifier_state = param_state;
    rpio.write(humidifier_pin_left, rpio.LOW);
    rpio.write(humidifier_pin_right, rpio.LOW);
  } else if (param_state === 'OFF') {
    //console.log("humidifier " + param_state)
    humidifier_state = param_state;
    rpio.write(humidifier_pin_left, rpio.HIGH);
    rpio.write(humidifier_pin_right, rpio.HIGH);
  } else {
    console.log('unsupported status : ' + param_state);
  }
});

let sendData = false;

serialParser.on('data', function(data) {
  if (sendData) {
    //console.log(data);
    if (data < 1024) {
      mq7_value = data;
    }
    const date = new Date().getTime();
    io.emit('sensorUpdate', date, mq7_value);
  }
});

io.sockets.on('connection', function(socket) {
  //console.log(data);
  sendData = true;
});
