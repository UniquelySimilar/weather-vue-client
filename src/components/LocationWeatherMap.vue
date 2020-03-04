<template>
    <div>
        <header id="header">
            <h3>Location Weather</h3>
            <label for="num-select">Select number of locations: </label>
            <select id="num-select" v-model="numLocations">
                <option v-for="option in options" v-bind:key="option.value" v-bind:value="option.value">
                    {{ option.text }}
                </option>
            </select>
            <button type="button" id="retrieve-btn" v-on:click="retrieveDataRenderMap">Retrieve/Refresh Map Data</button>
        </header>
        <div id="map"></div>
    </div>
</template>

<script>
    import {Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';
    import {fromLonLat} from 'ol/proj';
    import VectorLayer from 'ol/layer/Vector';
    import VectorSource from 'ol/source/Vector';
    import Feature from 'ol/Feature';
    import Point from 'ol/geom/Point';
    import {Icon, Style} from 'ol/style';
    import IconImg from '../assets/marker.png';
    import 'ol/ol.css';
    import axios from 'axios';
    import { getOptions } from '../weather-client-utils.js';

    export default {
        name: "LocationWeatherMap",
        data() {
            return {
                numLocations: 10,
                options: [],
                map: null,
                markerLayer: null,
                iconStyle: null
            }
        },
        methods: {
            retrieveDataRenderMap() {
                var that = this;
                axios.get("http://localhost:8080/locationweatherapi/data", {
                    params: {
                        numLocations: this.numLocations
                    }
                })
                .then(function (response) {
                    //console.log(response.data);
                    that.initMap(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                })
            },
            initMap(locationWeatherData) {
                //console.log(locationWeatherData);
                if (this.map === null) {
                    this.map = new Map({
                        target: 'map',
                        layers: [
                            new TileLayer({
                                source: new OSM()
                            })
                        ],
                        view: new View({
                            center: fromLonLat([0, 0]),
                            zoom: 0 // max: 28
                        })
                    });
                }

                if (this.markerLayer !== null) {
                    this.map.removeLayer(this.markerLayer);
                }

                // Add location markers
                let featuresAry = [];
                locationWeatherData.forEach(element => {
                    let pointAry = [element.coord.lon, element.coord.lat];
                    let feature = new Feature({
                        geometry: new Point(fromLonLat(pointAry)),
                        lon: element.coord.lon,
                        lat: element.coord.lat,
                        weatherDescription: element.weather[0] !== undefined ? element.weather[0].description : '',
                        temp: element.main.temp,
                        humidity: element.main.humidity,
                        windSpeed: element.wind.speed
                    });
                    feature.setStyle(this.iconStyle);
                    featuresAry.push(feature);
                });

                this.markerLayer = new VectorLayer({
                    source: new VectorSource({
                        features: featuresAry
                    })
                });
                this.map.addLayer(this.markerLayer);

                // Bind click handler for proprietary OL MapBrowserPointerEvent
                var that = this;
                this.map.on('click', function(event) {
                    //console.log(event);
                    let feature = that.map.forEachFeatureAtPixel(event.pixel, (feature) => { return feature; } );
                    if (feature) {
                        let featureProps = feature.getProperties();
                        let message = "LONGITUDE: " + featureProps.lon + "\nLATITUDE: " + featureProps.lat;
                        if (featureProps.weatherDescription !== undefined) {
                            message += "\nDESCRIPTION: " + featureProps.weatherDescription;
                        }
                        message += "\nTEMPERATURE: " + featureProps.temp + " F" + "\nHUMIDITY: " + featureProps.humidity + "%" +
                        "\nWIND SPEED: " + featureProps.windSpeed;
                        alert(message);
                    }
                })
            },
        },
        created() {
            this.options = getOptions();
            this.iconStyle = new Style({
                image: new Icon({
                    src: IconImg,
                    scale: 0.05
                })
            });
        },
    }
</script>

<style scoped>
    #header {
        margin-bottom: 1em;
    }

    #retrieve-btn {
        margin-left: 1em;
    }

    #map {
        height: 500px;
        width: 100%;
    }

</style>