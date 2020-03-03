<template>
  <location-weather-map></location-weather-map>
</template>

<script>
  import LocationWeatherMap from './components/LocationWeatherMap.vue';

  export default {
    name: 'App',
    components: {
      'location-weather-map': LocationWeatherMap
    }
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
