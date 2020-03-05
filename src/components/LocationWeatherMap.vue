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

        <div id="location-weather-modal" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Location Weather Information</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <label>LONGITUDE:</label><span>{{ locationWeather.longitude }}</span><br>
                        <label>LATITUDE:</label><span>{{ locationWeather.latitude }}</span><br>
                        <label>DESCRIPTION:</label><span>{{ locationWeather.description }}</span><br>
                        <label>TEMPERATURE:</label><span>{{ locationWeather.temperature }} F</span><br>
                        <label>HUMIDITY:</label><span>{{ locationWeather.humidity }}%</span><br>
                        <label>WIND SPEED:</label><span>{{ locationWeather.windSpeed }} MPH</span>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
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
    import { getOptions, $ } from '../weather-client-utils.js';

    export default {
        name: "LocationWeatherMap",
        data() {
            return {
                numLocations: 10,
                options: [],
                map: null,
                markerLayer: null,
                iconStyle: null,
                locationWeather: {
                    longitude: "",
                    latitude: "",
                    description: "",
                    temperature: "",
                    humidity: "",
                    windSpeed: ""
                }
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
            initMap(locationWeatherAry) {
                //console.log(locationWeatherAry);
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
                locationWeatherAry.forEach(element => {
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
                        that.locationWeather.longitude = featureProps.lon;
                        that.locationWeather.latitude = featureProps.lat;
                        that.locationWeather.description = featureProps.weatherDescription !== undefined ? featureProps.weatherDescription : "";
                        that.locationWeather.temperature = featureProps.temp;
                        that.locationWeather.humidity = featureProps.humidity;
                        that.locationWeather.windSpeed = featureProps.windSpeed;
                        $('#location-weather-modal').modal();
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

    .modal-title {
        font-weight: bold;
    }

    #location-weather-modal label {
        font-weight: bold;
        text-align: right;
        margin-right: 1em;
    }

</style>