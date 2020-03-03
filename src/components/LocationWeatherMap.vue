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
            <button type="button" id="retrieve-btn">Retrieve/Refresh Map Data</button>
        </header>
        <div id="map"></div>
    </div>
</template>

<script>
    import { getOptions } from '../utils.js';
    import 'ol/ol.css';
    import {Map, View} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import OSM from 'ol/source/OSM';
    import {fromLonLat} from 'ol/proj';
    // import VectorLayer from 'ol/layer/Vector';
    // import VectorSource from 'ol/source/Vector';
    // import Feature from 'ol/Feature';
    // import Point from 'ol/geom/Point';
    // import {Icon, Style} from 'ol/style';
    // import axios from 'axios';
    // import IconImg from './marker.png';

    export default {
        name: "LocationWeatherMap",
        data() {
            return {
                numLocations: 10,
                options: [],
                map: undefined
            }
        },
        methods: {
            initMap() {
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
        },
        created() {
            this.options = getOptions();
        }
    }
</script>

<style scoped>
    #header {
        margin-bottom: 1em;
    }

    #retrieve-btn {
        margin-left: 1em;
    }

    .map {
        height: 500px;
        width: 100%;
    }

</style>