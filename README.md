# Pi Sensor Service

This Node.js service collects sensor data from GPIO pins and an Arduino connected to the USB port of the RaspberryPi using a serial connection.

It provides a REST API to read sensor data, and mutate the state of a relay that controls a dehumidifier.


## How to use

After setting up and starting the server, access the endpoints via HTTP.

* /sensors/mq7
  - Readout of an MQ7 Carbon Monoxide sensor
* /sensors/temperature
  - Temperature value of a DHT22 sensor
* /sensors/humidity
  - Humidity value of the DHT22 sensor
* /switches/humidifier
  - Parameters "ON" or "OFF" to mutate state of a relay that controls a small humidifier.
* /plots/mq7
  - Realtime line chart of the Carbon Monoxide levels, using Highcharts.

### Prerequisites

* RaspberryPi
* Arduino (Only to support extra Analog pins for more than one sensor)
* DHT22 sensor
* MQ7 Carbon Monoxide sensor
* bcm2835 library
* Node.js

### Installing
Install [Node.js](https://nodejs.org/en/)
```
sudo apt install nodejs
```

Download and Install the [bcm2835 driver for the DHT22 sensor](http://www.open.com.au/mikem/bcm2835)
```
wget http://www.open.com.au/mikem/bcm2835/bcm2835-xx.tar.gz
tar zxvf bcm2835-1.xx.tar.gz
cd bcm2835-1.xx
./configure
make
sudo make check
sudo make install
```

Clone the project then start the server
```
npm start 
```

## Authors

* **David BT**  @davidbtbt

## License

No License.